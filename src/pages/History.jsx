import { useEffect, useMemo, useState } from 'react'
import CompanyToggle from '../components/CompanyToggle'
import { subscribeHistory, clearHistory } from '../data'
import { exportHistoryToExcel } from '../utils/excel'
import { formatEuro } from '../utils/money'
import { formatDateTime, currentMonthKey, monthLabel } from '../utils/datetime'

const COMPANY_STORAGE_KEY = 'azj.company'

export default function History() {
  const [company, setCompany] = useState(
    () => localStorage.getItem(COMPANY_STORAGE_KEY) || 'OG'
  )
  const [entries, setEntries] = useState([])
  const [busy, setBusy] = useState(false)
  const [toast, setToast] = useState('')

  const month = currentMonthKey()

  useEffect(() => {
    localStorage.setItem(COMPANY_STORAGE_KEY, company)
  }, [company])

  useEffect(() => {
    const unsub = subscribeHistory(company, setEntries, month)
    return unsub
  }, [company, month])

  const totalCount = entries.length
  const totalSum = useMemo(
    () => entries.reduce((s, e) => s + (e.priceCents || 0), 0),
    [entries]
  )

  function showToast(msg) {
    setToast(msg)
    setTimeout(() => setToast(''), 3500)
  }

  function handleExport() {
    if (entries.length === 0) {
      showToast('Keine Einträge zum Exportieren.')
      return
    }
    const file = exportHistoryToExcel(entries, company, month)
    showToast(`Excel erstellt: ${file}`)
  }

  async function handleReset() {
    if (entries.length === 0) {
      showToast('Nichts zum Zurücksetzen.')
      return
    }
    const ok = window.confirm(
      `Zuerst wird eine Excel-Datei mit ${entries.length} Einträgen erstellt, ` +
        `danach wird die History (${monthLabel(month)}) unwiderruflich gelöscht.\n\n` +
        `Fortfahren?`
    )
    if (!ok) return

    setBusy(true)
    try {
      // 1) Sicherung als Excel herunterladen …
      exportHistoryToExcel(entries, company, month)
      // 2) … dann in der Datenbank löschen.
      const removed = await clearHistory(company, month)
      showToast(`Excel gesichert und ${removed} Einträge gelöscht.`)
    } catch (err) {
      showToast('Fehler beim Zurücksetzen.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="history">
      <div className="calc-head">
        <h2>History</h2>
        <CompanyToggle value={company} onChange={setCompany} />
      </div>

      <section className="card">
        <div className="history-bar">
          <div className="history-stats">
            <div className="stat">
              <span className="stat-label">Monat</span>
              <span className="stat-value">{monthLabel(month)}</span>
            </div>
            <div className="stat">
              <span className="stat-label">Verkäufe</span>
              <span className="stat-value">{totalCount}</span>
            </div>
            <div className="stat">
              <span className="stat-label">Umsatz</span>
              <span className="stat-value">{formatEuro(totalSum)}</span>
            </div>
          </div>
          <div className="history-actions">
            <button className="btn btn-primary" onClick={handleExport}>
              Excel exportieren
            </button>
            <button
              className="btn btn-danger"
              onClick={handleReset}
              disabled={busy}
            >
              {busy ? 'Bitte warten…' : 'Monat abschließen & zurücksetzen'}
            </button>
          </div>
        </div>

        <p className="reset-note">
          „Monat abschließen" erstellt zuerst automatisch eine Excel-Sicherung
          und leert danach die History dieser Firma. Bitte die Datei gut
          aufbewahren.
        </p>
      </section>

      <section className="card">
        {entries.length === 0 ? (
          <p className="empty">Noch keine Verkäufe in diesem Monat.</p>
        ) : (
          <table className="table">
            <thead>
              <tr>
                <th>Datum / Uhrzeit</th>
                <th>Produkt</th>
                <th className="num">Preis</th>
                <th className="num">Erhalten</th>
                <th className="num">Rückgeld</th>
                <th>Mitarbeiter</th>
              </tr>
            </thead>
            <tbody>
              {entries.map((e) => (
                <tr key={e.id}>
                  <td>{formatDateTime(e.createdAt)}</td>
                  <td>{e.productName}</td>
                  <td className="num">{formatEuro(e.priceCents)}</td>
                  <td className="num">{formatEuro(e.givenCents)}</td>
                  <td className="num">{formatEuro(e.changeCents)}</td>
                  <td className="muted">{e.userEmail}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>

      {toast && <div className="toast">{toast}</div>}
    </div>
  )
}
