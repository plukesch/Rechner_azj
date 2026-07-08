import { useEffect, useMemo, useState } from 'react'
import CompanyToggle from '../components/CompanyToggle'
import ConfirmModal from '../components/ConfirmModal'
import { useAuth } from '../context/AuthContext'
import { isAdmin, ADMIN_EMAIL, companyLabel } from '../constants'
import { subscribeHistory, clearHistory } from '../data'
import { exportHistoryToExcel } from '../utils/excel'
import { formatEuro } from '../utils/money'
import { formatDateTime, currentMonthKey, monthLabel } from '../utils/datetime'

const COMPANY_STORAGE_KEY = 'azj.company'

export default function History() {
  const { user } = useAuth()
  const admin = isAdmin(user)
  const [company, setCompany] = useState(
    () => localStorage.getItem(COMPANY_STORAGE_KEY) || 'OG'
  )
  const [entries, setEntries] = useState([])
  const [busy, setBusy] = useState(false)
  const [toast, setToast] = useState('')
  const [confirmOpen, setConfirmOpen] = useState(false)

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

  function openReset() {
    if (entries.length === 0) {
      showToast('Nichts zum Zurücksetzen.')
      return
    }
    setConfirmOpen(true)
  }

  async function handleReset() {
    setBusy(true)
    try {
      // 1) Sicherung als Excel herunterladen …
      exportHistoryToExcel(entries, company, month)
      // 2) … dann in der Datenbank löschen.
      const removed = await clearHistory(company, month)
      setConfirmOpen(false)
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
            {admin && (
              <button className="btn btn-danger" onClick={openReset}>
                Monat abschließen & zurücksetzen
              </button>
            )}
          </div>
        </div>

        <p className="reset-note">
          {admin ? (
            <>
              „Monat abschließen" erstellt zuerst automatisch eine
              Excel-Sicherung und leert danach die History dieser Firma. Bitte
              die Datei gut aufbewahren.
            </>
          ) : (
            <>
              Exportieren kann jeder. Das Zurücksetzen der History („Monat
              abschließen") ist nur dem Admin-Account ({ADMIN_EMAIL}) möglich.
            </>
          )}
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

      <ConfirmModal
        open={confirmOpen}
        danger
        title="Monat abschließen?"
        confirmLabel="Exportieren & löschen"
        cancelLabel="Abbrechen"
        busy={busy}
        onConfirm={handleReset}
        onCancel={() => !busy && setConfirmOpen(false)}
      >
        <p>
          Es wird zuerst automatisch eine <strong>Excel-Sicherung</strong> mit{' '}
          <strong>{entries.length}</strong>{' '}
          {entries.length === 1 ? 'Eintrag' : 'Einträgen'} erstellt.
        </p>
        <p>
          Danach wird die History von{' '}
          <strong>{companyLabel(company)}</strong> für{' '}
          <strong>{monthLabel(month)}</strong> unwiderruflich gelöscht.
        </p>
        <p className="modal-warn">
          Bitte die heruntergeladene Excel-Datei anschließend gut aufbewahren.
        </p>
      </ConfirmModal>

      {toast && <div className="toast">{toast}</div>}
    </div>
  )
}
