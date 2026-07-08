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
