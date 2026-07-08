// Geld-Hilfsfunktionen. Intern rechnen wir in CENT (ganze Zahlen),
// damit keine Rundungsfehler durch Fließkommazahlen entstehen.

// Wandelt eine Benutzereingabe ("12,50" oder "12.5" oder "12") in Cent um.
// Gibt null zurück, wenn die Eingabe keine gültige Zahl ist.
export function parseToCents(input) {
  if (input === null || input === undefined) return null
  const cleaned = String(input).trim().replace(/\s|€/g, '').replace(',', '.')
  if (cleaned === '') return null
  const value = Number(cleaned)
  if (!Number.isFinite(value) || value < 0) return null
  return Math.round(value * 100)
}

// Formatiert Cent als deutschen Euro-String, z.B. 950 -> "9,50 €"
export function formatEuro(cents) {
  if (cents === null || cents === undefined || Number.isNaN(cents)) return '–'
  return (cents / 100).toLocaleString('de-DE', {
    style: 'currency',
    currency: 'EUR',
  })
}

// Formatiert Cent ohne Währungssymbol, z.B. 950 -> "9,50"
export function formatNumber(cents) {
  if (cents === null || cents === undefined || Number.isNaN(cents)) return ''
  return (cents / 100).toLocaleString('de-DE', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })
}
