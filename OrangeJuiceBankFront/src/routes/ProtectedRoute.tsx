import React from 'react'
import { Navigate } from 'react-router-dom'
import { getToken } from '../utils/token'

interface ProtectedRouteProps {
    children: React.ReactElement
}

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
    const token = getToken()

    if (!token) {
        return <Navigate to="/" replace />
    }

    return children
} 