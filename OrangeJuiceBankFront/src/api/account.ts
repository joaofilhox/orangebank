import axios from 'axios'
import { getToken } from '../utils/token'

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
    const token = getToken()
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
    const response = await api.get('/Account')
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
    const response = await api.get(`/Account/${accountId}/transactions`)
    return response.data
}

export async function createAccount(type: number): Promise<void> {
    await api.post('/Account', { type })
}

export async function deposit(accountId: string, amount: number): Promise<void> {
    await api.post(`/Account/${accountId}/deposit`, amount)
}

export async function withdraw(accountId: string, amount: number): Promise<void> {
    await api.post(`/Account/${accountId}/withdraw`, amount)
}

export interface TransferData {
    sourceAccountId: string
    destinationAccountId: string
    amount: number
}

export async function transfer(data: TransferData): Promise<void> {
    await api.post('/Account/transfer', data)
}

export interface TransferByEmailData {
    sourceAccountId: string
    destinationEmail: string
    amount: number
}

export async function transferByEmail(data: TransferByEmailData): Promise<void> {
    await api.post('/Account/transfer-by-email', data)
}

export interface Asset {
    id: string
    name: string
    type: number
    currentPrice: number
}

export async function getAssets(): Promise<Asset[]> {
    const response = await api.get('/Assets')
    return response.data
}

export async function buyAsset(accountId: string, assetId: string, quantity: number): Promise<void> {
    await api.post('/Investment/buy', {
        accountId,
        assetId,
        quantity
    })
}

export async function sellAsset(accountId: string, assetId: string, quantity: number): Promise<void> {
    await api.post('/Investment/sell', {
        accountId,
        assetId,
        quantity
    })
}

export interface PortfolioItem {
    investmentId: string
    accountId: string
    assetName: string
    assetType: string
    quantity: number
    averagePrice: number
    currentPrice: number
}

export async function getPortfolio(): Promise<PortfolioItem[]> {
    if (import.meta.env.VITE_ENABLE_DEBUG === 'true') {
        console.log('Chamando API de portfólio...')
    }
    const response = await api.get('/Investment/portfolio')
    if (import.meta.env.VITE_ENABLE_DEBUG === 'true') {
        console.log('Resposta da API de portfólio:', response.data)
    }
    return response.data
}

export interface InvestmentReport {
    portfolioItems: PortfolioItem[]
}

export async function getInvestmentReport(): Promise<InvestmentReport> {
    const response = await api.get('/Investment/report')
    return response.data
}

export interface TaxReport {
    year: number
    totalTax: number
    taxableIncome: number
    transactions: any[]
}

export async function getTaxReport(year?: number): Promise<TaxReport> {
    const currentYear = year || new Date().getFullYear()
    const response = await api.get(`/Tax/report/${currentYear}`)
    return response.data
}

export async function getTransactionsReport(accountId: string, from?: string, to?: string): Promise<Transaction[]> {
    const params = new URLSearchParams()
    if (from) params.append('from', from)
    if (to) params.append('to', to)

    const response = await api.get(`/Account/${accountId}/transactions-report?${params.toString()}`)
    return response.data
} 