-- RAPI / TUGASIN -- SKEMA BARU, TIDAK MENGIMPOR DATA PAYLOAD.
-- Jalankan sekali di Supabase SQL Editor setelah backup. Uji di project percobaan dulu.
-- Ini membuat tabel berawalan rapi_, bucket privat dan RLS. Tidak mengubah auth.users.
-- Berhenti jika objek bernama sama sudah ada: jangan hapus/mengganti data existing.
begin;

create schema rapi_private;
revoke all on schema rapi_private from public, anon;
grant usage on schema rapi_private to authenticated;

create sequence public.rapi_client_code_seq start 1;
create sequence public.rapi_order_code_seq start 1;
create sequence public.rapi_revision_code_seq start 1;
grant usage on sequence public.rapi_client_code_seq, public.rapi_order_code_seq, public.rapi_revision_code_seq to authenticated;

create table public.rapi_profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  client_code text not null unique default ('CL-' || nextval('public.rapi_client_code_seq')::text),
  name text not null default '',
  phone text,
  role text not null default 'client' check (role in ('admin','client')),
  status text not null default 'active' check (status in ('active','revoked')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create table public.rapi_orders (
  id uuid primary key default gen_random_uuid(),
  order_code text not null unique default ('ORD-' || nextval('public.rapi_order_code_seq')::text),
  client_id uuid not null references public.rapi_profiles(id) on delete restrict,
  title text not null check (length(trim(title)) between 1 and 160),
  brief text not null default '',
  status text not null default 'brief_in' check (status in ('brief_in','confirmed','in_progress','review','completed')),
  client_deadline timestamptz not null,
  price_rp bigint not null default 0 check (price_rp >= 0),
  paid_rp bigint not null default 0 check (paid_rp >= 0 and paid_rp <= price_rp),
  remaining_rp bigint generated always as (price_rp - paid_rp) stored,
  payment_status text generated always as (case when price_rp > 0 and paid_rp = price_rp then 'paid' when paid_rp > 0 then 'deposit' else 'unpaid' end) stored,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index rapi_orders_client_idx on public.rapi_orders(client_id);
create index rapi_orders_deadline_idx on public.rapi_orders(client_deadline);

-- Semua informasi sensitif operasional dipisah dari baris order yang dapat dilihat client.
create table public.rapi_order_internal (
  order_id uuid primary key references public.rapi_orders(id) on delete cascade,
  internal_deadline timestamptz,
  pic text,
  internal_price_rp bigint check (internal_price_rp is null or internal_price_rp >= 0),
  internal_notes text,
  updated_at timestamptz not null default now()
);
create table public.rapi_documents (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.rapi_orders(id) on delete cascade,
  label text not null check (length(trim(label)) between 1 and 160),
  document_type text not null check (document_type in ('brief','working_file','final','payment_proof')),
  version_label text not null default 'v1',
  storage_path text not null unique check (length(trim(storage_path)) > 0),
  shared_with_client boolean not null default false,
  created_at timestamptz not null default now()
);
create index rapi_documents_order_idx on public.rapi_documents(order_id);
create table public.rapi_revisions (
  id uuid primary key default gen_random_uuid(),
  revision_code text not null unique default ('REV-' || nextval('public.rapi_revision_code_seq')::text),
  order_id uuid not null references public.rapi_orders(id) on delete cascade,
  details text not null check (length(trim(details)) between 12 and 2000),
  status text not null default 'submitted' check (status in ('submitted','in_progress','completed','rejected')),
  requested_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index rapi_revisions_order_idx on public.rapi_revisions(order_id);

create function rapi_private.is_admin() returns boolean language sql stable security definer set search_path = '' as $$
  select exists (select 1 from public.rapi_profiles p where p.id = (select auth.uid()) and p.role = 'admin' and p.status = 'active');
$$;
create function rapi_private.is_active_client() returns boolean language sql stable security definer set search_path = '' as $$
  select exists (select 1 from public.rapi_profiles p where p.id = (select auth.uid()) and p.role = 'client' and p.status = 'active');
$$;
revoke all on function rapi_private.is_admin(), rapi_private.is_active_client() from public, anon;
grant execute on function rapi_private.is_admin(), rapi_private.is_active_client() to authenticated;

create function rapi_private.touch_updated_at() returns trigger language plpgsql set search_path = '' as $$
begin new.updated_at := now(); return new; end; $$;
create trigger rapi_profiles_updated before update on public.rapi_profiles for each row execute function rapi_private.touch_updated_at();
create trigger rapi_orders_updated before update on public.rapi_orders for each row execute function rapi_private.touch_updated_at();
create trigger rapi_internal_updated before update on public.rapi_order_internal for each row execute function rapi_private.touch_updated_at();
create trigger rapi_revisions_updated before update on public.rapi_revisions for each row execute function rapi_private.touch_updated_at();

-- Cocokkan deadline walaupun admin mengubah client_deadline setelah baris internal dibuat.
create function rapi_private.validate_internal_deadline() returns trigger language plpgsql set search_path = '' as $$
declare target_deadline timestamptz;
begin
  select client_deadline into target_deadline from public.rapi_orders where id = new.order_id for update;
  if new.internal_deadline is not null and new.internal_deadline > target_deadline then
    raise exception 'Deadline internal tidak boleh setelah deadline client';
  end if;
  return new;
end; $$;
create trigger rapi_internal_deadline_check before insert or update on public.rapi_order_internal for each row execute function rapi_private.validate_internal_deadline();
create function rapi_private.validate_client_deadline() returns trigger language plpgsql set search_path = '' as $$
begin
  if exists (select 1 from public.rapi_order_internal i where i.order_id = new.id and i.internal_deadline > new.client_deadline) then
    raise exception 'Deadline client tidak boleh sebelum deadline internal';
  end if;
  return new;
end; $$;
create trigger rapi_client_deadline_check before update of client_deadline on public.rapi_orders for each row execute function rapi_private.validate_client_deadline();

-- Profil dibuat secara eksplisit oleh operator tepercaya setelah akun dibuat di Auth.
-- Tidak memasang trigger pada auth.users dan tidak mengubah akun existing.

alter table public.rapi_profiles enable row level security;
alter table public.rapi_orders enable row level security;
alter table public.rapi_order_internal enable row level security;
alter table public.rapi_documents enable row level security;
alter table public.rapi_revisions enable row level security;
revoke all on public.rapi_profiles, public.rapi_orders, public.rapi_order_internal, public.rapi_documents, public.rapi_revisions from public, anon, authenticated;
grant select, insert, update, delete on public.rapi_profiles, public.rapi_orders, public.rapi_order_internal, public.rapi_documents to authenticated;
grant select, update, delete on public.rapi_revisions to authenticated;
-- Client tidak bisa memilih status, kode atau tanggal revisi: hanya kolom ini boleh diinsert.
grant insert (order_id, details) on public.rapi_revisions to authenticated;

create policy rapi_profiles_select on public.rapi_profiles for select to authenticated using (
  (select rapi_private.is_admin()) or ((select rapi_private.is_active_client()) and id = (select auth.uid()))
);
create policy rapi_profiles_admin_insert on public.rapi_profiles for insert to authenticated with check ((select rapi_private.is_admin()));
create policy rapi_profiles_admin_update on public.rapi_profiles for update to authenticated using ((select rapi_private.is_admin())) with check ((select rapi_private.is_admin()));
create policy rapi_profiles_admin_delete on public.rapi_profiles for delete to authenticated using ((select rapi_private.is_admin()));
create policy rapi_orders_select on public.rapi_orders for select to authenticated using (
  (select rapi_private.is_admin()) or ((select rapi_private.is_active_client()) and client_id = (select auth.uid()))
);
create policy rapi_orders_admin_insert on public.rapi_orders for insert to authenticated with check ((select rapi_private.is_admin()));
create policy rapi_orders_admin_update on public.rapi_orders for update to authenticated using ((select rapi_private.is_admin())) with check ((select rapi_private.is_admin()));
create policy rapi_orders_admin_delete on public.rapi_orders for delete to authenticated using ((select rapi_private.is_admin()));
create policy rapi_internal_admin_all on public.rapi_order_internal for all to authenticated using ((select rapi_private.is_admin())) with check ((select rapi_private.is_admin()));
create policy rapi_documents_select on public.rapi_documents for select to authenticated using (
  (select rapi_private.is_admin()) or (
    (select rapi_private.is_active_client()) and shared_with_client and exists (
      select 1 from public.rapi_orders o where o.id = order_id and o.client_id = (select auth.uid())
    )
  )
);
create policy rapi_documents_admin_insert on public.rapi_documents for insert to authenticated with check ((select rapi_private.is_admin()));
create policy rapi_documents_admin_update on public.rapi_documents for update to authenticated using ((select rapi_private.is_admin())) with check ((select rapi_private.is_admin()));
create policy rapi_documents_admin_delete on public.rapi_documents for delete to authenticated using ((select rapi_private.is_admin()));
create policy rapi_revisions_select on public.rapi_revisions for select to authenticated using (
  (select rapi_private.is_admin()) or ((select rapi_private.is_active_client()) and exists (
    select 1 from public.rapi_orders o where o.id = order_id and o.client_id = (select auth.uid())
  ))
);
create policy rapi_revisions_insert on public.rapi_revisions for insert to authenticated with check (
  (select rapi_private.is_admin()) or ((select rapi_private.is_active_client()) and exists (
    select 1 from public.rapi_orders o where o.id = order_id and o.client_id = (select auth.uid()) and o.status in ('review','completed')
  ))
);
create policy rapi_revisions_admin_update on public.rapi_revisions for update to authenticated using ((select rapi_private.is_admin())) with check ((select rapi_private.is_admin()));
create policy rapi_revisions_admin_delete on public.rapi_revisions for delete to authenticated using ((select rapi_private.is_admin()));

insert into storage.buckets (id, name, public) values ('rapi-order-documents','rapi-order-documents',false);
create policy rapi_storage_admin_select on storage.objects for select to authenticated using (bucket_id = 'rapi-order-documents' and (select rapi_private.is_admin()));
create policy rapi_storage_admin_insert on storage.objects for insert to authenticated with check (bucket_id = 'rapi-order-documents' and (select rapi_private.is_admin()));
create policy rapi_storage_admin_update on storage.objects for update to authenticated using (bucket_id = 'rapi-order-documents' and (select rapi_private.is_admin())) with check (bucket_id = 'rapi-order-documents' and (select rapi_private.is_admin()));
create policy rapi_storage_admin_delete on storage.objects for delete to authenticated using (bucket_id = 'rapi-order-documents' and (select rapi_private.is_admin()));
create policy rapi_storage_client_select on storage.objects for select to authenticated using (
  bucket_id = 'rapi-order-documents' and (select rapi_private.is_active_client()) and exists (
    select 1 from public.rapi_documents d join public.rapi_orders o on o.id=d.order_id
    where d.storage_path = name and d.shared_with_client and o.client_id = (select auth.uid())
  )
);
commit;
