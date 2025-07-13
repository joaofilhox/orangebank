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

export interface TransferByEmailData {
    sourceAccountId: string
    destinationEmail: string
    amount: number
}

export async function transferByEmail(data: TransferByEmailData): Promise<void> {
    await axios.post(
        `${API_URL}/Account/transfer-by-email`,
        data,
        {
            headers: {
                Authorization: `Bearer ${getToken()}`,
                'Content-Type': 'application/json'
            }
        }
    )
}

export interface Asset {
    id: string
    name: string
    type: number
    currentPrice: number
}

export async function getAssets(): Promise<Asset[]> {
    const response = await axios.get(`${API_URL}/Assets`, {
        headers: {
            Authorization: `Bearer ${getToken()}`
        }
    })
    return response.data
}

export async function buyAsset(accountId: string, assetId: string, quantity: number): Promise<void> {
    await axios.post(
        `${API_URL}/Investment/buy`,
        {
            accountId,
            assetId,
            quantity
        },
        {
            headers: {
                Authorization: `Bearer ${getToken()}`
            }
        }
    )
}

export async function sellAsset(accountId: string, assetId: string, quantity: number): Promise<void> {
    await axios.post(
        `${API_URL}/Investment/sell`,
        {
            accountId,
            assetId,
            quantity
        },
        {
            headers: {
                Authorization: `Bearer ${getToken()}`
            }
        }
    )
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
    console.log('Chamando API de portfólio...')
    const response = await axios.get(`${API_URL}/Investment/portfolio`, {
        headers: {
            Authorization: `Bearer ${getToken()}`
        }
    })
    console.log('Resposta da API de portfólio:', response.data)
    return response.data
}

export interface InvestmentReport {
    portfolioItems: PortfolioItem[]
}

export async function getInvestmentReport(): Promise<InvestmentReport> {
    console.log('Chamando API de relatório de investimentos...')
    const response = await axios.get(`${API_URL}/Reports/investments`, {
        headers: {
            Authorization: `Bearer ${getToken()}`
        }
    })
    console.log('Resposta da API de investimentos:', response.data)
    return response.data
}

export interface TaxReport {
    year: number
    totalTax: number
    taxableIncome: number
    transactions: any[]
}

export async function getTaxReport(year?: number): Promise<TaxReport> {
    const response = await axios.get(`${API_URL}/Reports/tax`, {
        params: year ? { year } : {},
        headers: {
            Authorization: `Bearer ${getToken()}`
        }
    })
    return response.data
}

export async function getTransactionsReport(accountId: string, from?: string, to?: string): Promise<Transaction[]> {
    const params: any = {}
    if (from) params.from = from
    if (to) params.to = to

    const response = await axios.get(`${API_URL}/Account/${accountId}/statement`, {
        params,
        headers: {
            Authorization: `Bearer ${getToken()}`
        }
    })
    return response.data
} 