import { Navigate } from 'react-router-dom'
import { getToken } from '../utils/token'
import type { ReactNode } from 'react'

export function ProtectedRoute({ children }: { children: ReactNode }) {
    const token = getToken()
    if (!token) {
        return <Navigate to="/" replace />
    }
    return <>{children}</>
}

export function PublicOnlyRoute({ children }: { children: ReactNode }) {
    const token = getToken()
    if (token) {
        return <Navigate to="/dashboard" replace />
    }
    return <>{children}</>
} 