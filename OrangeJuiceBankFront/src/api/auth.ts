import axios from 'axios'

const API_URL = 'https://localhost:7253/api'

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
    const response = await axios.post<LoginResponse>(`${API_URL}/Auth/login`, {
        email,
        password,
    })
    return response.data
}

export async function registerUser(data: RegisterUserData): Promise<void> {
    await axios.post(`${API_URL}/Auth/register`, data)
} 