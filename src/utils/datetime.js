// Datums-Hilfsfunktionen rund um den Monats-Reset.

// Aktueller Monatsschlüssel im Format "YYYY-MM", z.B. "2026-07".
export function currentMonthKey(date = new Date()) {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  return `${y}-${m}`
}

// Menschlich lesbarer Monatsname, z.B. "Juli 2026".
export function monthLabel(monthKey) {
  const [y, m] = monthKey.split('-').map(Number)
  const d = new Date(y, m - 1, 1)
  return d.toLocaleDateString('de-DE', { month: 'long', year: 'numeric' })
}

// Wandelt einen Firestore-Timestamp (oder Date) in einen deutschen
// Datum-/Zeit-String um, z.B. "08.07.2026 14:35".
export function formatDateTime(value) {
  if (!value) return ''
  const d = value.toDate ? value.toDate() : new Date(value)
  return d.toLocaleString('de-DE', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}
