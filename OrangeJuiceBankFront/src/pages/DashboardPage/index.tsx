import { useEffect, useState } from 'react'
import { getAccounts, getTransactions, type Account, type Transaction } from '../../api/account'
import BalanceCard from '../../components/BalanceCard'
import TransactionList from '../../components/TransactionList'
import { useNavigate } from 'react-router-dom'
import { clearToken } from '../../utils/token'

export default function DashboardPage() {
    const [accounts, setAccounts] = useState<Account[]>([])
    const [transactions, setTransactions] = useState<Transaction[]>([])
    const [loading, setLoading] = useState(true)
    const navigate = useNavigate()

    useEffect(() => {
        const fetchData = async () => {
            try {
                const acc = await getAccounts()
                setAccounts(acc)

                // Busca transações da primeira conta
                if (acc.length > 0) {
                    const tx = await getTransactions(acc[0].id)
                    setTransactions(tx.slice(0, 5))
                }
            } catch (err) {
                console.error('Erro ao carregar dados:', err)
                // Não limpa o token automaticamente, apenas mostra dados vazios
                setAccounts([])
                setTransactions([])
            } finally {
                setLoading(false)
            }
        }

        fetchData()
    }, [navigate])

    if (loading) {
        return <p>Carregando dados...</p>
    }

    return (
        <div style={{ padding: '2rem' }}>
            <h1>Dashboard</h1>

            {accounts.length === 0 ? (
                <div style={{
                    padding: '2rem',
                    textAlign: 'center',
                    border: '1px solid #ddd',
                    borderRadius: '8px',
                    marginBottom: '2rem'
                }}>
                    <p>Nenhuma conta encontrada ou API não disponível.</p>
                    <p>Você está logado com sucesso! 🎉</p>
                </div>
            ) : (
                <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', marginBottom: '2rem' }}>
                    {accounts.map((account) => (
                        <BalanceCard
                            key={account.id}
                            title={
                                account.type === 'Corrente'
                                    ? 'Conta Corrente'
                                    : 'Conta Investimento'
                            }
                            amount={account.balance}
                        />
                    ))}
                </div>
            )}

            {transactions.length > 0 && <TransactionList transactions={transactions} />}

            <div style={{ marginTop: '2rem', display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                <button onClick={() => alert('Depositar')} style={btnStyle}>
                    Depositar
                </button>
                <button onClick={() => alert('Sacar')} style={btnStyle}>
                    Sacar
                </button>
                <button onClick={() => alert('Transferir')} style={btnStyle}>
                    Transferir
                </button>
                <button onClick={() => alert('Investir')} style={btnStyle}>
                    Investir
                </button>
                <button
                    onClick={() => {
                        clearToken()
                        navigate('/')
                    }}
                    style={{ ...btnStyle, background: '#dc3545' }}
                >
                    Sair
                </button>
            </div>
        </div>
    )
}

const btnStyle: React.CSSProperties = {
    padding: '0.75rem 1.5rem',
    background: '#007bff',
    color: '#fff',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer'
} 