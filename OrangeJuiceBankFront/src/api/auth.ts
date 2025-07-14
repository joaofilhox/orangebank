import axios from 'axios'

// Configuração da API usando variáveis de ambiente
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api'
const API_TIMEOUT = parseInt(import.meta.env.VITE_API_TIMEOUT || '10000')

// Configuração do axios
const api = axios.create({
    baseURL: API_BASE_URL,
    timeout: API_TIMEOUT,
    headers: {
        'Content-Type': 'application/json',
    },
})

// Interceptor para adicionar token de autenticação
api.interceptors.request.use((config) => {
    const token = localStorage.getItem(import.meta.env.VITE_TOKEN_KEY || 'orange_juice_token')
    if (token) {
        config.headers.Authorization = `Bearer ${token}`
    }
    return config
})

// Interceptor para tratamento de erros
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (import.meta.env.VITE_ENABLE_LOGS === 'true') {
            console.error('API Error:', error.response?.data || error.message)
        }
        return Promise.reject(error)
    }
)

export interface RegisterUserData {
    fullName: string
    email: string
    cpf: string
    birthDate: string // ISO string
    password: string
}

export interface LoginResponse {
    token: string
    user: {
        id: number
        name: string
        email: string
    }
}

export async function login(email: string, password: string): Promise<LoginResponse> {
    const response = await api.post<LoginResponse>('/Auth/login', {
        email,
        password,
    })
    return response.data
}

export async function registerUser(data: RegisterUserData): Promise<void> {
    await api.post('/Auth/register', data)
} 