import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function Register() {
  const { register } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [password2, setPassword2] = useState('')
  const [accessCode, setAccessCode] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')

    if (password.length < 6) {
      setError('Das Passwort muss mindestens 6 Zeichen haben.')
      return
    }
    if (password !== password2) {
      setError('Die Passwörter stimmen nicht überein.')
      return
    }

    setBusy(true)
    try {
      await register(email.trim(), password, accessCode)
    } catch (err) {
      setError(mapError(err))
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="auth-screen">
      <form className="auth-card" onSubmit={handleSubmit}>
        <div className="auth-logo">
          <span className="brand-mark large" aria-hidden="true" />
          <h1>Registrieren</h1>
          <p className="auth-sub">Nur mit Zugangscode möglich</p>
        </div>

        <label>
          E-Mail
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="username"
            required
          />
        </label>

        <label>
          Passwort
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="new-password"
            required
          />
        </label>

        <label>
          Passwort wiederholen
          <input
            type="password"
            value={password2}
            onChange={(e) => setPassword2(e.target.value)}
            autoComplete="new-password"
            required
          />
        </label>

        <label>
          Zugangscode
          <input
            type="text"
            value={accessCode}
            onChange={(e) => setAccessCode(e.target.value)}
            placeholder="AZJ-…"
            required
          />
        </label>

        {error && <div className="alert alert-error">{error}</div>}

        <button className="btn btn-primary btn-block" disabled={busy}>
          {busy ? 'Konto wird erstellt…' : 'Konto erstellen'}
        </button>

        <p className="auth-foot">
          Schon ein Konto? <Link to="/login">Anmelden</Link>
        </p>
      </form>
    </div>
  )
}

function mapError(err) {
  switch (err.code) {
    case 'access-code':
      return 'Falscher Zugangscode.'
    case 'auth/email-already-in-use':
      return 'Für diese E-Mail gibt es bereits ein Konto.'
    case 'auth/invalid-email':
      return 'Ungültige E-Mail-Adresse.'
    case 'auth/weak-password':
      return 'Das Passwort ist zu schwach (mind. 6 Zeichen).'
    default:
      return 'Registrierung fehlgeschlagen. Bitte erneut versuchen.'
  }
}
