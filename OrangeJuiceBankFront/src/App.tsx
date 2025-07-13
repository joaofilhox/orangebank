import { Routes, Route } from 'react-router-dom'
import LoginPage from './pages/LoginPage'
import DashboardPage from './pages/DashboardPage'
import { ProtectedRoute, PublicOnlyRoute } from './components/ProtectedRoute'

function App() {
  return (
    <Routes>
      <Route path="/" element={
        <PublicOnlyRoute>
          <LoginPage />
        </PublicOnlyRoute>
      } />
      <Route path="/dashboard" element={
        <ProtectedRoute>
          <DashboardPage />
        </ProtectedRoute>
      } />
    </Routes>
  )
}

export default App
