// Datenzugriffsschicht: alle Firestore-Operationen an einem Ort.
import {
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  query,
  where,
  onSnapshot,
  getDocs,
  serverTimestamp,
  writeBatch,
} from 'firebase/firestore'
import { db } from './firebase'
import { currentMonthKey } from './utils/datetime'

const PRODUCTS = 'products'
const HISTORY = 'history'

/* ---------------------------------------------------------------- Produkte */

// Live-Abo aller Produkte einer Firma. Ruft `callback(produkteArray)` auf,
// gibt eine Funktion zum Beenden des Abos zurück.
export function subscribeProducts(company, callback) {
  const q = query(collection(db, PRODUCTS), where('company', '==', company))
  return onSnapshot(q, (snap) => {
    const items = snap.docs.map((d) => ({ id: d.id, ...d.data() }))
    items.sort((a, b) => (a.name || '').localeCompare(b.name || '', 'de'))
    callback(items)
  })
}

// Legt ein Produkt an (falls es den Namen in der Firma noch nicht gibt).
// Gibt das (ggf. bestehende) Produkt-Objekt zurück.
export async function addProduct({ name, priceCents, company }) {
  const trimmed = name.trim()
  const nameLower = trimmed.toLowerCase()

  // Prüfen, ob es das Produkt in dieser Firma schon gibt.
  const existingQ = query(
    collection(db, PRODUCTS),
    where('company', '==', company),
    where('nameLower', '==', nameLower)
  )
  const existing = await getDocs(existingQ)
  if (!existing.empty) {
    const d = existing.docs[0]
    return { id: d.id, ...d.data() }
  }

  const ref = await addDoc(collection(db, PRODUCTS), {
    name: trimmed,
    nameLower,
    priceCents,
    company,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  })
  return { id: ref.id, name: trimmed, nameLower, priceCents, company }
}

export async function updateProduct(id, { name, priceCents }) {
  const patch = { updatedAt: serverTimestamp() }
  if (name !== undefined) {
    patch.name = name.trim()
    patch.nameLower = name.trim().toLowerCase()
  }
  if (priceCents !== undefined) patch.priceCents = priceCents
  await updateDoc(doc(db, PRODUCTS, id), patch)
}

export async function deleteProduct(id) {
  await deleteDoc(doc(db, PRODUCTS, id))
}

/* ---------------------------------------------------------------- History */

// Live-Abo der History einer Firma für einen Monat (Standard: aktueller Monat).
// Bewusst OHNE `orderBy` in der Abfrage – so wird kein zusammengesetzter
// Firestore-Index benötigt. Sortiert wird im Browser (neueste zuerst).
export function subscribeHistory(company, callback, month = currentMonthKey()) {
  const q = query(
    collection(db, HISTORY),
    where('company', '==', company),
    where('month', '==', month)
  )
  return onSnapshot(
    q,
    (snap) => {
      const items = snap.docs.map((d) => ({ id: d.id, ...d.data() }))
      items.sort((a, b) => millis(b.createdAt) - millis(a.createdAt))
      callback(items)
    },
    (err) => {
      // Falls die Abfrage doch scheitert, im Log sichtbar machen.
      console.error('History konnte nicht geladen werden:', err)
    }
  )
}

// Millisekunden aus einem Firestore-Timestamp. Ein gerade erst geschriebener
// Eintrag hat lokal noch keinen Server-Timestamp (null) – der zählt als „jetzt",
// damit er ganz oben erscheint.
function millis(ts) {
  if (!ts) return Date.now()
  if (typeof ts.toMillis === 'function') return ts.toMillis()
  return new Date(ts).getTime()
}

// Speichert einen Verkauf in der History.
export async function addHistoryEntry({
  company,
  productName,
  priceCents,
  givenCents,
  changeCents,
  userEmail,
}) {
  await addDoc(collection(db, HISTORY), {
    company,
    productName,
    priceCents,
    givenCents,
    changeCents,
    userEmail: userEmail || '',
    month: currentMonthKey(),
    createdAt: serverTimestamp(),
  })
}

// Löscht alle History-Einträge einer Firma für einen Monat (Monats-Reset).
// Nach dem Löschen zählt `count` die entfernten Einträge.
export async function clearHistory(company, month = currentMonthKey()) {
  const q = query(
    collection(db, HISTORY),
    where('company', '==', company),
    where('month', '==', month)
  )
  const snap = await getDocs(q)
  // Firestore-Batches fassen max. 500 Schreibvorgänge; in Blöcken löschen.
  const docs = snap.docs
  for (let i = 0; i < docs.length; i += 450) {
    const batch = writeBatch(db)
    docs.slice(i, i + 450).forEach((d) => batch.delete(d.ref))
    await batch.commit()
  }
  return docs.length
}
