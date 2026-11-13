/** Server-only mapping: each client has a distinct Gmail plus alias.
 * Keep CLIENT_AUTH_GMAIL unchanged after accounts have been created.
 * No email is sent to clients; aliases route to the admin's own mailbox.
 */
export function clientAuthEmail(phone: string): string | null {
  const base = (process.env.CLIENT_AUTH_GMAIL || '').trim().toLowerCase()
  const match = /^([a-z0-9][a-z0-9.]{0,29})@gmail\.com$/.exec(base)
  if (!match || match[1].endsWith('.') || match[1].includes('..')) return null
  const digits = phone.replace(/\D/g, '')
  if (!/^628[0-9]{7,12}$/.test(digits)) return null
  const local = `${match[1]}+tg${digits}`
  return local.length <= 64 ? `${local}@gmail.com` : null
}
