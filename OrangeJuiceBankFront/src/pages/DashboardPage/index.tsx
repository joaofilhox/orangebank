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
                // Ordenar: Conta Corrente (type: 1) primeiro, depois Conta Investimento (type: 2)
                const sortedAccounts = acc.sort((a, b) => a.type - b.type)
                setAccounts(sortedAccounts)

                // Busca transações da primeira conta (separadamente para não afetar as contas)
                if (sortedAccounts.length > 0) {
                    try {
                        const tx = await getTransactions(sortedAccounts[0].id)
                        setTransactions(tx.slice(0, 5))
                    } catch (txError) {
                        console.error('Erro ao carregar transações:', txError)
                        setTransactions([])
                    }
                }
            } catch (err) {
                console.error('Erro ao carregar contas:', err)
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
                    <p>Carregando suas contas...</p>
                </div>
            ) : (
                <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', marginBottom: '2rem' }}>
                    {accounts.map((account) => (
                        <BalanceCard
                            key={account.id}
                            title={
                                account.type === 1
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
                <button onClick={() => navigate('/deposit')} style={btnStyle}>
                    Depositar
                </button>
                <button onClick={() => navigate('/withdraw')} style={btnStyle}>
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