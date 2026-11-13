/** Normalize Indonesian mobile numbers, without accepting letters or extensions. */
export function normalizeIndonesianPhone(input: string): string | null {
  const trimmed = input.trim()
  if (!/^\+?[0-9\s().-]+$/.test(trimmed)) return null
  const digits = trimmed.replace(/[^0-9]/g, '')
  const national = digits.startsWith('0') ? '62' + digits.slice(1) : digits
  return /^628[0-9]{7,12}$/.test(national) ? '+' + national : null
}
