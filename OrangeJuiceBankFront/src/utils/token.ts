// Configuração das chaves de token usando variáveis de ambiente
const TOKEN_KEY = import.meta.env.VITE_TOKEN_KEY || 'orange_juice_token'
const REFRESH_TOKEN_KEY = import.meta.env.VITE_REFRESH_TOKEN_KEY || 'orange_juice_refresh_token'

export function saveToken(token: string) {
    localStorage.setItem(TOKEN_KEY, token)
}

export function getToken(): string | null {
    return localStorage.getItem(TOKEN_KEY)
}

export function clearToken() {
    localStorage.removeItem(TOKEN_KEY)
    localStorage.removeItem(REFRESH_TOKEN_KEY)
}

export function saveRefreshToken(token: string) {
    localStorage.setItem(REFRESH_TOKEN_KEY, token)
}

export function getRefreshToken(): string | null {
    return localStorage.getItem(REFRESH_TOKEN_KEY)
}

export function isAuthenticated(): boolean {
    return getToken() !== null
} 