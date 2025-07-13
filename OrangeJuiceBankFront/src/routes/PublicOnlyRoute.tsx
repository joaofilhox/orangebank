import React from 'react'
import { Navigate } from 'react-router-dom'
import { getToken } from '../utils/token'

interface PublicOnlyRouteProps {
    children: React.ReactElement
}

export default function PublicOnlyRoute({ children }: PublicOnlyRouteProps) {
    const token = getToken()

    if (token) {
        return <Navigate to="/dashboard" replace />
    }

    return children
}
