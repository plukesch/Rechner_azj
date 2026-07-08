import { useEffect, useMemo, useState } from 'react'
import CompanyToggle from '../components/CompanyToggle'
import {
  subscribeProducts,
  addProduct,
  updateProduct,
  deleteProduct,
} from '../data'
import { parseToCents, formatEuro, formatNumber } from '../utils/money'

const COMPANY_STORAGE_KEY = 'azj.company'

export default function Products() {
  const [company, setCompany] = useState(
    () => localStorage.getItem(COMPANY_STORAGE_KEY) || 'OG'
  )
  const [products, setProducts] = useState([])
  const [search, setSearch] = useState('')

  // Formular für neues Produkt.
  const [newName, setNewName] = useState('')
  const [newPrice, setNewPrice] = useState('')
  const [error, setError] = useState('')

  // Bearbeitungszustand.
  const [editId, setEditId] = useState(null)
  const [editName, setEditName] = useState('')
  const [editPrice, setEditPrice] = useState('')

  useEffect(() => {
    localStorage.setItem(COMPANY_STORAGE_KEY, company)
  }, [company])

  useEffect(() => {
    const unsub = subscribeProducts(company, setProducts)
    return unsub
  }, [company])

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    if (!q) return products
    return products.filter((p) => p.nameLower.includes(q))
  }, [products, search])

  async function handleAdd(e) {
    e.preventDefault()
    setError('')
    const cents = parseToCents(newPrice)
    if (!newName.trim()) return setError('Bitte einen Produktnamen eingeben.')
    if (cents === null || cents <= 0)
      return setError('Bitte einen gültigen Preis eingeben.')

    const exists = products.some(
      (p) => p.nameLower === newName.trim().toLowerCase()
    )
    if (exists) return setError('Dieses Produkt gibt es bereits.')

    await addProduct({ name: newName.trim(), priceCents: cents, company })
    setNewName('')
    setNewPrice('')
  }

  function startEdit(p) {
    setEditId(p.id)
    setEditName(p.name)
    setEditPrice(formatNumber(p.priceCents))
    setError('')
  }

  function cancelEdit() {
    setEditId(null)
    setEditName('')
    setEditPrice('')
  }

  async function saveEdit(id) {
    const cents = parseToCents(editPrice)
    if (!editName.trim()) return setError('Der Name darf nicht leer sein.')
    if (cents === null || cents <= 0)
      return setError('Bitte einen gültigen Preis eingeben.')
    await updateProduct(id, { name: editName.trim(), priceCents: cents })
    cancelEdit()
  }

  async function handleDelete(p) {
    if (window.confirm(`Produkt „${p.name}" wirklich löschen?`)) {
      await deleteProduct(p.id)
    }
  }

  return (
    <div className="products">
      <div className="calc-head">
        <h2>Produkte</h2>
        <CompanyToggle value={company} onChange={setCompany} />
      </div>

      {/* Neues Produkt */}
      <section className="card">
        <h3 className="card-title">Neues Produkt</h3>
        <form className="add-form" onSubmit={handleAdd}>
          <input
            type="text"
            placeholder="Produktname"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
          />
          <input
            type="text"
            inputMode="decimal"
            placeholder="Preis €"
            value={newPrice}
            onChange={(e) => setNewPrice(e.target.value)}
          />
          <button className="btn btn-primary">Hinzufügen</button>
        </form>
        {error && <div className="alert alert-error">{error}</div>}
      </section>

      {/* Liste */}
      <section className="card">
        <div className="list-head">
          <h3 className="card-title">
            {filtered.length}{' '}
            {filtered.length === 1 ? 'Produkt' : 'Produkte'}
          </h3>
          <input
            className="search-input"
            type="search"
            placeholder="Suchen…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {filtered.length === 0 ? (
          <p className="empty">Noch keine Produkte für diese Firma.</p>
        ) : (
          <table className="table">
            <thead>
              <tr>
                <th>Produkt</th>
                <th className="num">Preis</th>
                <th className="actions-col">Aktionen</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((p) =>
                editId === p.id ? (
                  <tr key={p.id} className="editing">
                    <td>
                      <input
                        type="text"
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                      />
                    </td>
                    <td className="num">
                      <input
                        className="price-input"
                        type="text"
                        inputMode="decimal"
                        value={editPrice}
                        onChange={(e) => setEditPrice(e.target.value)}
                      />
                    </td>
                    <td className="actions-col">
                      <button
                        className="btn btn-small btn-primary"
                        onClick={() => saveEdit(p.id)}
                      >
                        Speichern
                      </button>
                      <button
                        className="btn btn-small btn-ghost"
                        onClick={cancelEdit}
                      >
                        Abbrechen
                      </button>
                    </td>
                  </tr>
                ) : (
                  <tr key={p.id}>
                    <td>{p.name}</td>
                    <td className="num">{formatEuro(p.priceCents)}</td>
                    <td className="actions-col">
                      <button
                        className="btn btn-small btn-ghost"
                        onClick={() => startEdit(p)}
                      >
                        Bearbeiten
                      </button>
                      <button
                        className="btn btn-small btn-danger"
                        onClick={() => handleDelete(p)}
                      >
                        Löschen
                      </button>
                    </td>
                  </tr>
                )
              )}
            </tbody>
          </table>
        )}
      </section>
    </div>
  )
}
