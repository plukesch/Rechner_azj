import { COMPANIES } from '../constants'

// Umschalter zwischen OG und See-Well-GmbH.
export default function CompanyToggle({ value, onChange }) {
  return (
    <div className="company-toggle" role="tablist" aria-label="Firma">
      {COMPANIES.map((c) => (
        <button
          key={c.key}
          type="button"
          role="tab"
          aria-selected={value === c.key}
          className={`company-tab ${value === c.key ? 'active' : ''}`}
          onClick={() => onChange(c.key)}
        >
          {c.label}
        </button>
      ))}
    </div>
  )
}
