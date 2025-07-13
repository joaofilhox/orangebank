import axios from 'axios'
import { getToken } from '../utils/token'

const API_URL = 'http://localhost:5020/api'

export interface Account {
    id: number
    accountNumber: string
    type: string
    balance: number
}

export interface Transaction {
    id: number
    type: string
    amount: number
    description: string
    date: string
}

// Função para listar contas do usuário
export async function getAccounts(): Promise<Account[]> {
    const response = await axios.get(`${API_URL}/accounts`, {
        headers: {
            Authorization: `Bearer ${getToken()}`
        }
    })
    return response.data
}

// Função para buscar transações de uma conta
export async function getTransactions(accountId: number): Promise<Transaction[]> {
    const response = await axios.get(`${API_URL}/accounts/${accountId}/transactions`, {
        headers: {
            Authorization: `Bearer ${getToken()}`
        }
    })
    return response.data
} 