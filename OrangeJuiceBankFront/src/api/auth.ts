import axios from 'axios'

const API_URL = 'http://localhost:5020/api'

export interface LoginResponse {
    token: string
    user: {
        id: number
        name: string
        email: string
    }
}

export async function login(email: string, password: string): Promise<LoginResponse> {
    const response = await axios.post<LoginResponse>(`${API_URL}/auth/login`, {
        email,
        password,
    })
    return response.data
} 