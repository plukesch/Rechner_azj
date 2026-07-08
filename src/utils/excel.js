// Export der History nach Excel (.xlsx) mit der SheetJS-Bibliothek.
import * as XLSX from 'xlsx'
import { formatDateTime, monthLabel } from './datetime'
import { formatNumber } from './money'
import { companyLabel } from '../constants'

// entries: Array von History-Dokumenten aus Firestore.
// companyKey / monthKey: nur für Dateiname/Überschrift.
export function exportHistoryToExcel(entries, companyKey, monthKey) {
  // Zeilen in gut lesbare Spalten übersetzen (Beträge als Zahl mit 2 Dezimalen).
  const rows = entries.map((e) => ({
    'Datum / Uhrzeit': formatDateTime(e.createdAt),
    Produkt: e.productName || '',
    'Preis (€)': formatNumber(e.priceCents),
    'Erhalten (€)': formatNumber(e.givenCents),
    'Rückgeld (€)': formatNumber(e.changeCents),
    Mitarbeiter: e.userEmail || '',
  }))

  // Summenzeile am Ende.
  const totalPrice = entries.reduce((s, e) => s + (e.priceCents || 0), 0)
  if (rows.length > 0) {
    rows.push({})
    rows.push({
      'Datum / Uhrzeit': 'SUMME',
      Produkt: `${entries.length} Verkäufe`,
      'Preis (€)': formatNumber(totalPrice),
    })
  }

  const worksheet = XLSX.utils.json_to_sheet(rows)

  // Spaltenbreiten für gute Lesbarkeit.
  worksheet['!cols'] = [
    { wch: 18 },
    { wch: 30 },
    { wch: 12 },
    { wch: 12 },
    { wch: 12 },
    { wch: 28 },
  ]

  const workbook = XLSX.utils.book_new()
  const sheetName = companyLabel(companyKey).slice(0, 28)
  XLSX.utils.book_append_sheet(workbook, worksheet, sheetName)

  const safeCompany = companyLabel(companyKey).replace(/[^\w]+/g, '-')
  const fileName = `History_${safeCompany}_${monthKey}.xlsx`
  XLSX.writeFile(workbook, fileName)

  return fileName
}
