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
        return (
            <div className="page-container">
                <div className="container">
                    <div className="loading">
                        Carregando dados...
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="page-container">
            <div className="container">
                <div className="page-header fade-in">
                    <h1 className="page-title text-primary">🍊 Orange Juice Bank</h1>
                    <p className="page-subtitle">Bem-vindo ao seu dashboard</p>
                </div>

                {accounts.length === 0 ? (
                    <div className="card fade-in">
                        <div className="text-center">
                            <p className="text-muted">Carregando suas contas...</p>
                        </div>
                    </div>
                ) : (
                    <div className="fade-in">
                        <div className="card">
                            <div className="card-header">
                                <h2 className="card-title">Suas Contas</h2>
                            </div>
                            <div style={{
                                display: 'grid',
                                gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                                gap: 'var(--spacing-4)'
                            }}>
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
                        </div>

                        {transactions.length > 0 && (
                            <div className="card">
                                <div className="card-header">
                                    <h2 className="card-title">Últimas Transações</h2>
                                </div>
                                <TransactionList transactions={transactions} />
                            </div>
                        )}
                    </div>
                )}

                <div className="card fade-in">
                    <div className="card-header">
                        <h2 className="card-title">Ações Rápidas</h2>
                    </div>
                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
                        gap: 'var(--spacing-4)'
                    }}>
                        <button
                            onClick={() => navigate('/deposit')}
                            className="btn btn-primary"
                        >
                            💰 Depositar
                        </button>
                        <button
                            onClick={() => navigate('/withdraw')}
                            className="btn btn-secondary"
                        >
                            💸 Sacar
                        </button>
                        <button
                            onClick={() => navigate('/transfer')}
                            className="btn btn-primary"
                        >
                            🔄 Transferir
                        </button>
                        <button
                            onClick={() => navigate('/buy-asset')}
                            className="btn btn-success"
                        >
                            📈 Investir
                        </button>
                        <button
                            onClick={() => navigate('/reports')}
                            className="btn btn-secondary"
                        >
                            📊 Relatórios
                        </button>
                        <button
                            onClick={() => {
                                clearToken()
                                navigate('/')
                            }}
                            className="btn btn-danger"
                        >
                            🚪 Sair
                        </button>
                    </div>
                </div>

                <div className="card fade-in" style={{
                    border: '3px solid var(--color-warning)',
                    backgroundColor: 'var(--color-warning-light)',
                    marginTop: 'var(--spacing-4)'
                }}>
                    <div className="card-header">
                        <h2 className="card-title" style={{ color: 'var(--color-warning)' }}>
                            ⚠️ ÁREA ADMINISTRATIVA - GERENCIAMENTO DE ATIVOS
                        </h2>
                    </div>
                    <div style={{ padding: '1rem' }}>
                        <p style={{
                            marginBottom: '1.5rem',
                            fontSize: '1.1rem',
                            fontWeight: '500',
                            color: 'var(--color-text)'
                        }}>
                            <strong>🎯 Função Administrativa:</strong> Gerenciar preços dos ativos e simular impacto na tributação das operações
                        </p>
                        <div style={{
                            display: 'flex',
                            justifyContent: 'center',
                            gap: '1rem',
                            flexWrap: 'wrap'
                        }}>
                            <button
                                onClick={() => navigate('/assets-management')}
                                className="btn"
                                style={{
                                    backgroundColor: 'var(--color-warning)',
                                    color: 'white',
                                    fontSize: '1.2rem',
                                    padding: '1rem 2rem',
                                    border: 'none',
                                    borderRadius: '8px',
                                    cursor: 'pointer',
                                    fontWeight: 'bold',
                                    boxShadow: '0 4px 8px rgba(0,0,0,0.2)',
                                    transition: 'all 0.3s ease'
                                }}
                                onMouseOver={(e) => {
                                    e.currentTarget.style.transform = 'translateY(-2px)'
                                    e.currentTarget.style.boxShadow = '0 6px 12px rgba(0,0,0,0.3)'
                                }}
                                onMouseOut={(e) => {
                                    e.currentTarget.style.transform = 'translateY(0)'
                                    e.currentTarget.style.boxShadow = '0 4px 8px rgba(0,0,0,0.2)'
                                }}
                            >
                                💰 GERENCIAR PREÇOS DOS ATIVOS
                            </button>
                        </div>
                        <p style={{
                            marginTop: '1rem',
                            fontSize: '0.9rem',
                            color: 'var(--color-text-secondary)',
                            textAlign: 'center'
                        }}>
                            <strong>📋 Funcionalidades Administrativas:</strong><br />
                            • Listar e gerenciar todos os ativos disponíveis<br />
                            • Atualizar preços em tempo real<br />
                            • Visualizar regras de tributação (15% ações, 22% renda fixa)<br />
                            • Simular impacto das variações de preço nos impostos<br />
                            • Testar cenários de mercado para planejamento tributário
                        </p>
                    </div>
                </div>
            </div>
        </div>
    )
} 