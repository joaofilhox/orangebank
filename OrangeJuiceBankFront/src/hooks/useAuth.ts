import { useCallback } from 'react'
import { getToken, clearToken } from '../utils/token'

export function useAuth() {
    const isAuthenticated = !!getToken()

    const logout = useCallback(() => {
        clearToken()
        window.location.href = '/'
    }, [])

    return { isAuthenticated, logout }
} 