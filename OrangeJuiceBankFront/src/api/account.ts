import axios from 'axios'
import { getToken } from '../utils/token'

const API_URL = 'https://localhost:7253/api'

export interface Account {
    id: string
    type: number
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
    const token = getToken()
    const response = await axios.get(`${API_URL}/Account`, {
        headers: {
            Authorization: `Bearer ${token}`
        }
    })
    return response.data
}

// Função para verificar se o usuário tem contas
export async function hasAccounts(): Promise<boolean> {
    try {
        const accounts = await getAccounts()
        return accounts.length > 0
    } catch (error: any) {
        console.error('Erro ao verificar contas:', error)
        return false
    }
}

// Função para buscar transações de uma conta
export async function getTransactions(accountId: string): Promise<Transaction[]> {
    const response = await axios.get(`${API_URL}/Account/${accountId}/transactions`, {
        headers: {
            Authorization: `Bearer ${getToken()}`
        }
    })
    return response.data
}

export async function createAccount(type: number): Promise<void> {
    const token = getToken()
    await axios.post(
        `${API_URL}/Account`,
        { type },
        {
            headers: {
                Authorization: `Bearer ${token}`
            }
        }
    )
}

export async function deposit(accountId: string, amount: number): Promise<void> {
    await axios.post(
        `${API_URL}/Account/${accountId}/deposit`,
        amount,
        {
            headers: {
                Authorization: `Bearer ${getToken()}`,
                'Content-Type': 'application/json'
            }
        }
    )
}

export async function withdraw(accountId: string, amount: number): Promise<void> {
    await axios.post(
        `${API_URL}/Account/${accountId}/withdraw`,
        amount,
        {
            headers: {
                Authorization: `Bearer ${getToken()}`,
                'Content-Type': 'application/json'
            }
        }
    )
}

export interface TransferData {
    sourceAccountId: string
    destinationAccountId: string
    amount: number
}

export async function transfer(data: TransferData): Promise<void> {
    await axios.post(
        `${API_URL}/Account/transfer`,
        data,
        {
            headers: {
                Authorization: `Bearer ${getToken()}`,
                'Content-Type': 'application/json'
            }
        }
    )
} 