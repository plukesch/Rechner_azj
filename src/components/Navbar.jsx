import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function Navbar() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  async function handleLogout() {
    await logout()
    navigate('/login')
  }

  return (
    <header className="navbar">
      <div className="navbar-inner">
        <div className="brand">
          <span className="brand-mark" aria-hidden="true" />
          <span className="brand-text">
            Kassen-Rechner <span className="brand-sub">AZJ</span>
          </span>
        </div>

        <nav className="nav-links">
          <NavLink to="/" end>
            Rechner
          </NavLink>
          <NavLink to="/produkte">Produkte</NavLink>
          <NavLink to="/history">History</NavLink>
        </nav>

        <div className="nav-user">
          <span className="nav-email" title={user?.email}>
            {user?.email}
          </span>
          <button className="btn btn-ghost" onClick={handleLogout}>
            Abmelden
          </button>
        </div>
      </div>
    </header>
  )
}
