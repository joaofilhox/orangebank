export function saveToken(token: string) {
    localStorage.setItem('token', token)
}

export function getToken(): string | null {
    return localStorage.getItem('token')
}

export function clearToken() {
    localStorage.removeItem('token')
} 