import { useEffect, useMemo, useRef, useState } from 'react'
import CompanyToggle from '../components/CompanyToggle'
import { useAuth } from '../context/AuthContext'
import { subscribeProducts, addProduct, addHistoryEntry } from '../data'
import { parseToCents, formatEuro, formatNumber } from '../utils/money'
import { calculateChange } from '../utils/change'

const COMPANY_STORAGE_KEY = 'azj.company'

export default function Calculator() {
  const { user } = useAuth()
  const [company, setCompany] = useState(
    () => localStorage.getItem(COMPANY_STORAGE_KEY) || 'OG'
  )
  const [products, setProducts] = useState([])

  const [productName, setProductName] = useState('')
  const [priceInput, setPriceInput] = useState('')
  const [givenInput, setGivenInput] = useState('')
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [saving, setSaving] = useState(false)
  const [toast, setToast] = useState('')

  const boxRef = useRef(null)

  // Firma merken.
  useEffect(() => {
    localStorage.setItem(COMPANY_STORAGE_KEY, company)
  }, [company])

  // Produkte der gewählten Firma live laden.
  useEffect(() => {
    const unsub = subscribeProducts(company, setProducts)
    return unsub
  }, [company])

  // Dropdown schließen, wenn außerhalb geklickt wird.
  useEffect(() => {
    function onClick(e) {
      if (boxRef.current && !boxRef.current.contains(e.target)) {
        setShowSuggestions(false)
      }
    }
    document.addEventListener('mousedown', onClick)
    return () => document.removeEventListener('mousedown', onClick)
  }, [])

  const priceCents = parseToCents(priceInput)
  const givenCents = parseToCents(givenInput)
  const { changeCents, sufficient, breakdown } = useMemo(
    () => calculateChange(priceCents, givenCents),
    [priceCents, givenCents]
  )

  // Passende Produkte (ab 1 Zeichen). Treffer, die vorne beginnen, zuerst.
  const suggestions = useMemo(() => {
    const q = productName.trim().toLowerCase()
    if (!q) return []
    const matches = products.filter((p) => p.nameLower.includes(q))
    matches.sort((a, b) => {
      const aStarts = a.nameLower.startsWith(q) ? 0 : 1
      const bStarts = b.nameLower.startsWith(q) ? 0 : 1
      if (aStarts !== bStarts) return aStarts - bStarts
      return a.name.localeCompare(b.name, 'de')
    })
    return matches.slice(0, 8)
  }, [products, productName])

  const knownProduct = products.find(
    (p) => p.nameLower === productName.trim().toLowerCase()
  )

  function selectProduct(p) {
    setProductName(p.name)
    setPriceInput(formatNumber(p.priceCents))
    setShowSuggestions(false)
  }

  function resetForm() {
    setProductName('')
    setPriceInput('')
    setGivenInput('')
    setShowSuggestions(false)
  }

  const canSave =
    productName.trim() !== '' &&
    priceCents !== null &&
    priceCents > 0 &&
    givenCents !== null &&
    sufficient

  async function handleSave() {
    if (!canSave) return
    setSaving(true)
    try {
      // Produkt merken (legt es an, falls es neu ist).
      await addProduct({
        name: productName.trim(),
        priceCents,
        company,
      })
      // Verkauf in die History schreiben.
      await addHistoryEntry({
        company,
        productName: productName.trim(),
        priceCents,
        givenCents,
        changeCents,
        userEmail: user?.email,
      })
      setToast(`Gespeichert · Rückgeld ${formatEuro(changeCents)}`)
      resetForm()
      setTimeout(() => setToast(''), 3000)
    } catch (err) {
      setToast('Fehler beim Speichern.')
      setTimeout(() => setToast(''), 3000)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="calc">
      <div className="calc-head">
        <h2>Rückgeld-Rechner</h2>
        <CompanyToggle value={company} onChange={setCompany} />
      </div>

      <div className="calc-grid">
        {/* --------- Eingabe --------- */}
        <section className="card">
          <div className="field" ref={boxRef}>
            <label htmlFor="product">Produkt</label>
            <input
              id="product"
              type="text"
              value={productName}
              placeholder="Name eingeben oder suchen…"
              autoComplete="off"
              onChange={(e) => {
                setProductName(e.target.value)
                setShowSuggestions(true)
              }}
              onFocus={() => setShowSuggestions(true)}
            />
            {showSuggestions && suggestions.length > 0 && (
              <ul className="suggestions">
                {suggestions.map((p) => (
                  <li key={p.id}>
                    <button type="button" onClick={() => selectProduct(p)}>
                      <span>{p.name}</span>
                      <span className="sug-price">
                        {formatEuro(p.priceCents)}
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            )}
            {productName.trim() && !knownProduct && (
              <p className="field-hint">
                Neues Produkt – wird beim Speichern für {company === 'OG' ? 'die OG' : 'die See-Well-GmbH'} gemerkt.
              </p>
            )}
          </div>

          <div className="field-row">
            <div className="field">
              <label htmlFor="price">Preis (€)</label>
              <input
                id="price"
                type="text"
                inputMode="decimal"
                value={priceInput}
                placeholder="0,00"
                onChange={(e) => setPriceInput(e.target.value)}
              />
            </div>
            <div className="field">
              <label htmlFor="given">Erhalten (€)</label>
              <input
                id="given"
                type="text"
                inputMode="decimal"
                value={givenInput}
                placeholder="0,00"
                onChange={(e) => setGivenInput(e.target.value)}
              />
            </div>
          </div>

          <button
            className="btn btn-primary btn-block"
            onClick={handleSave}
            disabled={!canSave || saving}
          >
            {saving ? 'Speichern…' : 'Verkauf speichern'}
          </button>
        </section>

        {/* --------- Ergebnis --------- */}
        <section className="card result-card">
          <div className="result-label">Rückgeld</div>
          <div
            className={`result-amount ${
              givenCents !== null && !sufficient ? 'is-negative' : ''
            }`}
          >
            {givenCents !== null && priceCents !== null
              ? sufficient
                ? formatEuro(changeCents)
                : 'Betrag zu niedrig'
              : '–'}
          </div>

          {givenCents !== null && !sufficient && priceCents !== null && (
            <p className="result-hint">
              Es fehlen noch {formatEuro(Math.abs(changeCents))}.
            </p>
          )}

          {sufficient && changeCents > 0 && (
            <div className="breakdown">
              <div className="breakdown-title">Stückelung</div>
              <ul>
                {breakdown.map((b) => (
                  <li key={b.label}>
                    <span className="bd-count">{b.count}×</span>
                    <span className="bd-label">{b.label}</span>
                    <span className={`bd-type bd-${b.type.toLowerCase()}`}>
                      {b.type}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {sufficient && changeCents === 0 && givenCents !== null && (
            <p className="result-hint">Passend – kein Rückgeld nötig.</p>
          )}
        </section>
      </div>

      {toast && <div className="toast">{toast}</div>}
    </div>
  )
}
