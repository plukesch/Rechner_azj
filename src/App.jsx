import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './context/AuthContext'
import Navbar from './components/Navbar'
import Login from './pages/Login'
import Register from './pages/Register'
import Calculator from './pages/Calculator'
import Products from './pages/Products'
import History from './pages/History'

// Schützt Seiten, die nur eingeloggt erreichbar sein sollen.
function Protected({ children }) {
  const { user, loading } = useAuth()
  if (loading) return <div className="center-screen">Lädt…</div>
  if (!user) return <Navigate to="/login" replace />
  return (
    <>
      <Navbar />
      <main className="page">{children}</main>
    </>
  )
}

// Login/Register nur zeigen, wenn NICHT eingeloggt.
function PublicOnly({ children }) {
  const { user, loading } = useAuth()
  if (loading) return <div className="center-screen">Lädt…</div>
  if (user) return <Navigate to="/" replace />
  return children
}

export default function App() {
  return (
    <Routes>
      <Route
        path="/login"
        element={
          <PublicOnly>
            <Login />
          </PublicOnly>
        }
      />
      <Route
        path="/register"
        element={
          <PublicOnly>
            <Register />
          </PublicOnly>
        }
      />
      <Route
        path="/"
        element={
          <Protected>
            <Calculator />
          </Protected>
        }
      />
      <Route
        path="/produkte"
        element={
          <Protected>
            <Products />
          </Protected>
        }
      />
      <Route
        path="/history"
        element={
          <Protected>
            <History />
          </Protected>
        }
      />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
