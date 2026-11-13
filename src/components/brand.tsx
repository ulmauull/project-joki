import Link from 'next/link'

export function Brand({
  compact = false,
  inverse = false,
}: {
  compact?: boolean
  inverse?: boolean
}) {
  return (
    <Link
      href="/"
      className={`inline-flex items-center gap-3 font-bold ${inverse ? 'text-white' : 'text-[#172140]'}`}
    >
      <span className="grid size-10 place-items-center rounded-[13px] bg-[#4666ff] text-lg text-white shadow-lg shadow-[#4666ff]/25">
        t.
      </span>
      {!compact && <span className="text-lg tracking-[-0.03em]">tugasin</span>}
    </Link>
  )
}
