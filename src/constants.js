// Zentrale Konstanten für die App.

// Die beiden Firmen. `key` wird in der Datenbank gespeichert,
// `label` wird in der Oberfläche angezeigt.
export const COMPANIES = [
  { key: 'OG', label: 'OG' },
  { key: 'GMBH', label: 'See-Well-GmbH' },
]

export function companyLabel(key) {
  const c = COMPANIES.find((x) => x.key === key)
  return c ? c.label : key
}

// Zugangscode für die Registrierung. Über .env überschreibbar.
export const REGISTER_ACCESS_CODE =
  import.meta.env.VITE_REGISTER_ACCESS_CODE || 'AZJ-2026'

// Admin-Account: darf als Einziger die History löschen ("Monat abschließen").
// WICHTIG: Wird diese Adresse geändert, muss sie AUCH in firestore.rules
// angepasst werden – sonst greift der echte Schutz nicht.
export const ADMIN_EMAIL = (
  import.meta.env.VITE_ADMIN_EMAIL || 'office@azj.at'
).toLowerCase()

// Prüft, ob ein Firebase-User der Admin ist.
export function isAdmin(user) {
  return !!user?.email && user.email.toLowerCase() === ADMIN_EMAIL
}
