import { Routes, Route } from 'react-router-dom'
import { useState, useEffect } from 'react'
import LoginPage from './pages/LoginPage'
import DashboardPage from './pages/DashboardPage'
import RegisterPage from './pages/RegisterPage'
import DepositPage from './pages/DepositPage'
import ProtectedRoute from './routes/ProtectedRoute'
import PublicOnlyRoute from './routes/PublicOnlyRoute'

function App() {
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Simula um carregamento inicial
    const timer = setTimeout(() => {
      setIsLoading(false)
    }, 100)

    // Captura erros não tratados
    const handleError = (event: ErrorEvent) => {
      console.error('Erro capturado:', event.error)
      setError('Ocorreu um erro inesperado. Por favor, recarregue a página.')
    }

    window.addEventListener('error', handleError)
    return () => {
      clearTimeout(timer)
      window.removeEventListener('error', handleError)
    }
  }, [])

  if (isLoading) {
    return (
      <div style={{
        padding: '2rem',
        textAlign: 'center',
        maxWidth: '600px',
        margin: '0 auto',
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center'
      }}>
        <h1>Carregando Orange Juice Bank...</h1>
        <p>Inicializando aplicação...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div style={{
        padding: '2rem',
        textAlign: 'center',
        maxWidth: '600px',
        margin: '0 auto',
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center'
      }}>
        <h1>Erro</h1>
        <p>{error}</p>
        <button
          onClick={() => window.location.reload()}
          style={{
            padding: '0.75rem 1.5rem',
            background: '#007bff',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          Recarregar Página
        </button>
      </div>
    )
  }

  return (
    <div style={{ minHeight: '100vh' }}>
      <Routes>
        <Route
          path="/"
          element={
            <PublicOnlyRoute>
              <LoginPage />
            </PublicOnlyRoute>
          }
        />
        <Route path="/register" element={<RegisterPage />} />
        <Route
          path="/deposit"
          element={
            <ProtectedRoute>
              <DepositPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <DashboardPage />
            </ProtectedRoute>
          }
        />
      </Routes>
    </div>
  )
}

export default App
