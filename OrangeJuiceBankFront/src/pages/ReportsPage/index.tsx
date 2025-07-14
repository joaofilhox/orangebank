import { useState, useEffect } from 'react'
import { getTaxReport, getInvestmentReport, getAccounts, getTransactionsReport, getPortfolio } from '../../api/account'
import type { Account, Transaction, TaxReport, PortfolioItem } from '../../api/account'
import { useNavigate } from 'react-router-dom'

export default function ReportsPage() {
    const navigate = useNavigate()
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')
    const [report, setReport] = useState<any>(null)
    const [accounts, setAccounts] = useState<Account[]>([])
    const [selectedYear, setSelectedYear] = useState(new Date().getFullYear())
    const [dateFrom, setDateFrom] = useState('')
    const [dateTo, setDateTo] = useState('')

    useEffect(() => {
        const fetchAccounts = async () => {
            try {
                const data = await getAccounts()
                const currentAccounts = data.filter((acc) => acc.type === 1) // type 1 = Corrente
                setAccounts(currentAccounts)
            } catch (err) {
                console.error(err)
                setError('Erro ao buscar contas.')
            }
        }
        fetchAccounts()
    }, [])

    const handleTaxReport = async () => {
        setLoading(true)
        setError('')
        setReport(null)
        try {
            const data = await getTaxReport(selectedYear)
            setReport({ type: 'tax', data })
        } catch (err) {
            console.error(err)
            setError('Erro ao gerar relatório de imposto.')
        } finally {
            setLoading(false)
        }
    }

    const handlePortfolio = async () => {
        setLoading(true)
        setError('')
        setReport(null)
        try {
            const data = await getPortfolio()
            console.log('Dados do portfólio:', data)
            setReport({ type: 'portfolio', data })
        } catch (err) {
            console.error('Erro ao buscar portfólio:', err)
            setError('Erro ao buscar portfólio.')
        } finally {
            setLoading(false)
        }
    }

    const handleInvestmentsReport = async () => {
        setLoading(true)
        setError('')
        setReport(null)
        try {
            const data = await getInvestmentReport()
            console.log('Dados do relatório de investimentos:', data)
            setReport({ type: 'investments', data })
        } catch (err) {
            console.error('Erro ao gerar relatório de investimentos:', err)
            setError('Erro ao gerar relatório de investimentos.')
        } finally {
            setLoading(false)
        }
    }

    const handleTransactionsReport = async () => {
        if (accounts.length === 0) {
            setError('Nenhuma conta corrente encontrada.')
            return
        }
        setLoading(true)
        setError('')
        setReport(null)
        try {
            const data = await getTransactionsReport(accounts[0].id, dateFrom, dateTo)
            setReport({ type: 'transactions', data })
        } catch (err) {
            console.error(err)
            setError('Erro ao gerar extrato da conta.')
        } finally {
            setLoading(false)
        }
    }

    const renderTaxReport = (data: TaxReport) => (
        <div className="card">
            <div className="card-header">
                <h3 className="card-title">Relatório de Imposto de Renda - {data.year}</h3>
            </div>
            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                gap: 'var(--spacing-4)',
                marginBottom: 'var(--spacing-4)'
            }}>
                <div className="card" style={{
                    background: 'linear-gradient(135deg, var(--primary-orange) 0%, var(--primary-orange-dark) 100%)',
                    color: 'var(--white)',
                    border: 'none'
                }}>
                    <div style={{ textAlign: 'center' }}>
                        <div style={{ fontSize: 'var(--font-size-sm)', opacity: 0.9 }}>
                            Renda Tributável
                        </div>
                        <div style={{ fontSize: 'var(--font-size-xl)', fontWeight: '700' }}>
                            R$ {data.taxableIncome?.toFixed(2) || '0,00'}
                        </div>
                    </div>
                </div>
                <div className="card" style={{
                    background: 'linear-gradient(135deg, var(--error) 0%, #dc2626 100%)',
                    color: 'var(--white)',
                    border: 'none'
                }}>
                    <div style={{ textAlign: 'center' }}>
                        <div style={{ fontSize: 'var(--font-size-sm)', opacity: 0.9 }}>
                            Imposto Total
                        </div>
                        <div style={{ fontSize: 'var(--font-size-xl)', fontWeight: '700' }}>
                            R$ {data.totalTax?.toFixed(2) || '0,00'}
                        </div>
                    </div>
                </div>
            </div>
            {data.transactions && data.transactions.length > 0 && (
                <div>
                    <h4 style={{ marginBottom: 'var(--spacing-4)' }}>Transações do Ano</h4>
                    <div style={{ overflowX: 'auto' }}>
                        <table style={{
                            width: '100%',
                            borderCollapse: 'collapse',
                            fontSize: 'var(--font-size-sm)'
                        }}>
                            <thead>
                                <tr style={{
                                    backgroundColor: 'var(--gray-100)',
                                    borderBottom: '2px solid var(--gray-200)'
                                }}>
                                    <th style={{
                                        padding: 'var(--spacing-3)',
                                        textAlign: 'left',
                                        fontWeight: '600',
                                        color: 'var(--gray-700)'
                                    }}>
                                        Data
                                    </th>
                                    <th style={{
                                        padding: 'var(--spacing-3)',
                                        textAlign: 'left',
                                        fontWeight: '600',
                                        color: 'var(--gray-700)'
                                    }}>
                                        Tipo
                                    </th>
                                    <th style={{
                                        padding: 'var(--spacing-3)',
                                        textAlign: 'right',
                                        fontWeight: '600',
                                        color: 'var(--gray-700)'
                                    }}>
                                        Valor
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                {data.transactions.map((tx: any, index: number) => (
                                    <tr key={index} style={{
                                        borderBottom: '1px solid var(--gray-200)'
                                    }}>
                                        <td style={{
                                            padding: 'var(--spacing-3)',
                                            color: 'var(--gray-600)'
                                        }}>
                                            {new Date(tx.date).toLocaleDateString('pt-BR')}
                                        </td>
                                        <td style={{
                                            padding: 'var(--spacing-3)',
                                            color: 'var(--gray-700)',
                                            fontWeight: '500'
                                        }}>
                                            {tx.type}
                                        </td>
                                        <td style={{
                                            padding: 'var(--spacing-3)',
                                            textAlign: 'right',
                                            fontWeight: '600',
                                            color: tx.amount >= 0 ? 'var(--success)' : 'var(--error)'
                                        }}>
                                            {tx.amount >= 0 ? '+' : ''} R$ {tx.amount?.toFixed(2) || '0,00'}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    )

    const renderTransactionsReport = (data: Transaction[]) => (
        <div className="card">
            <div className="card-header">
                <h3 className="card-title">Extrato da Conta Corrente</h3>
            </div>
            <div style={{ marginBottom: 'var(--spacing-4)' }}>
                <strong>Total de transações:</strong> {data.length}
            </div>
            {data.length > 0 ? (
                <div style={{ overflowX: 'auto' }}>
                    <table style={{
                        width: '100%',
                        borderCollapse: 'collapse',
                        fontSize: 'var(--font-size-sm)'
                    }}>
                        <thead>
                            <tr style={{
                                backgroundColor: 'var(--gray-100)',
                                borderBottom: '2px solid var(--gray-200)'
                            }}>
                                <th style={{
                                    padding: 'var(--spacing-3)',
                                    textAlign: 'left',
                                    fontWeight: '600',
                                    color: 'var(--gray-700)'
                                }}>
                                    Data
                                </th>
                                <th style={{
                                    padding: 'var(--spacing-3)',
                                    textAlign: 'left',
                                    fontWeight: '600',
                                    color: 'var(--gray-700)'
                                }}>
                                    Tipo
                                </th>
                                <th style={{
                                    padding: 'var(--spacing-3)',
                                    textAlign: 'left',
                                    fontWeight: '600',
                                    color: 'var(--gray-700)'
                                }}>
                                    Descrição
                                </th>
                                <th style={{
                                    padding: 'var(--spacing-3)',
                                    textAlign: 'right',
                                    fontWeight: '600',
                                    color: 'var(--gray-700)'
                                }}>
                                    Valor
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            {data.map((tx) => (
                                <tr key={tx.id} style={{
                                    borderBottom: '1px solid var(--gray-200)',
                                    transition: 'background-color var(--transition-fast)'
                                }}
                                    onMouseEnter={(e) => {
                                        e.currentTarget.style.backgroundColor = 'var(--gray-50)'
                                    }}
                                    onMouseLeave={(e) => {
                                        e.currentTarget.style.backgroundColor = 'transparent'
                                    }}
                                >
                                    <td style={{
                                        padding: 'var(--spacing-3)',
                                        color: 'var(--gray-600)'
                                    }}>
                                        {new Date(tx.date).toLocaleDateString('pt-BR')}
                                    </td>
                                    <td style={{
                                        padding: 'var(--spacing-3)',
                                        color: 'var(--gray-700)',
                                        fontWeight: '500'
                                    }}>
                                        {tx.type}
                                    </td>
                                    <td style={{
                                        padding: 'var(--spacing-3)',
                                        color: 'var(--gray-600)'
                                    }}>
                                        {tx.description}
                                    </td>
                                    <td style={{
                                        padding: 'var(--spacing-3)',
                                        textAlign: 'right',
                                        fontWeight: '600',
                                        color: tx.amount >= 0 ? 'var(--success)' : 'var(--error)'
                                    }}>
                                        {tx.amount >= 0 ? '+' : ''} R$ {tx.amount.toFixed(2)}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            ) : (
                <p className="text-muted text-center">Nenhuma transação encontrada.</p>
            )}
        </div>
    )

    const renderPortfolio = (data: PortfolioItem[]) => {
        if (!data || data.length === 0) {
            return (
                <div className="card">
                    <div className="card-header">
                        <h3 className="card-title">Meus Investimentos</h3>
                    </div>
                    <p className="text-muted text-center">Nenhum investimento encontrado no portfólio.</p>
                </div>
            )
        }

        return (
            <div className="card">
                <div className="card-header">
                    <h3 className="card-title">Meus Investimentos Atuais</h3>
                </div>
                <div style={{ marginBottom: 'var(--spacing-4)' }}>
                    <strong>Total de ativos:</strong> {data.length}
                </div>
                <div style={{ overflowX: 'auto' }}>
                    <table style={{
                        width: '100%',
                        borderCollapse: 'collapse',
                        fontSize: 'var(--font-size-sm)'
                    }}>
                        <thead>
                            <tr style={{
                                backgroundColor: 'var(--gray-100)',
                                borderBottom: '2px solid var(--gray-200)'
                            }}>
                                <th style={{
                                    padding: 'var(--spacing-3)',
                                    textAlign: 'left',
                                    fontWeight: '600',
                                    color: 'var(--gray-700)'
                                }}>
                                    Ativo
                                </th>
                                <th style={{
                                    padding: 'var(--spacing-3)',
                                    textAlign: 'left',
                                    fontWeight: '600',
                                    color: 'var(--gray-700)'
                                }}>
                                    Tipo
                                </th>
                                <th style={{
                                    padding: 'var(--spacing-3)',
                                    textAlign: 'right',
                                    fontWeight: '600',
                                    color: 'var(--gray-700)'
                                }}>
                                    Quantidade
                                </th>
                                <th style={{
                                    padding: 'var(--spacing-3)',
                                    textAlign: 'right',
                                    fontWeight: '600',
                                    color: 'var(--gray-700)'
                                }}>
                                    Valor Atual
                                </th>
                                <th style={{
                                    padding: 'var(--spacing-3)',
                                    textAlign: 'right',
                                    fontWeight: '600',
                                    color: 'var(--gray-700)'
                                }}>
                                    Total
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            {data.map((item, index) => (
                                <tr key={index} style={{
                                    borderBottom: '1px solid var(--gray-200)',
                                    transition: 'background-color var(--transition-fast)'
                                }}
                                    onMouseEnter={(e) => {
                                        e.currentTarget.style.backgroundColor = 'var(--gray-50)'
                                    }}
                                    onMouseLeave={(e) => {
                                        e.currentTarget.style.backgroundColor = 'transparent'
                                    }}
                                >
                                    <td style={{
                                        padding: 'var(--spacing-3)',
                                        color: 'var(--gray-700)',
                                        fontWeight: '500'
                                    }}>
                                        {item.assetName || 'N/A'}
                                    </td>
                                    <td style={{
                                        padding: 'var(--spacing-3)',
                                        color: 'var(--gray-600)'
                                    }}>
                                        {item.assetType || 'N/A'}
                                    </td>
                                    <td style={{
                                        padding: 'var(--spacing-3)',
                                        textAlign: 'right',
                                        color: 'var(--gray-700)',
                                        fontWeight: '500'
                                    }}>
                                        {item.quantity}
                                    </td>
                                    <td style={{
                                        padding: 'var(--spacing-3)',
                                        textAlign: 'right',
                                        color: 'var(--gray-600)'
                                    }}>
                                        R$ {item.currentPrice?.toFixed(2) || '0,00'}
                                    </td>
                                    <td style={{
                                        padding: 'var(--spacing-3)',
                                        textAlign: 'right',
                                        fontWeight: '600',
                                        color: 'var(--primary-orange)'
                                    }}>
                                        R$ {((item.currentPrice || 0) * item.quantity).toFixed(2)}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        )
    }

    const renderInvestmentsReport = (data: any) => {
        return (
            <div className="card">
                <div className="card-header">
                    <h3 className="card-title">Relatório de Investimentos</h3>
                </div>
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                    gap: 'var(--spacing-4)'
                }}>
                    <div className="card" style={{
                        background: 'linear-gradient(135deg, var(--success) 0%, #059669 100%)',
                        color: 'var(--white)',
                        border: 'none'
                    }}>
                        <div style={{ textAlign: 'center' }}>
                            <div style={{ fontSize: 'var(--font-size-sm)', opacity: 0.9 }}>
                                Total Investido
                            </div>
                            <div style={{ fontSize: 'var(--font-size-xl)', fontWeight: '700' }}>
                                R$ {data.totalInvested?.toFixed(2) || '0,00'}
                            </div>
                        </div>
                    </div>
                    <div className="card" style={{
                        background: 'linear-gradient(135deg, var(--info) 0%, #2563eb 100%)',
                        color: 'var(--white)',
                        border: 'none'
                    }}>
                        <div style={{ textAlign: 'center' }}>
                            <div style={{ fontSize: 'var(--font-size-sm)', opacity: 0.9 }}>
                                Valor Atual
                            </div>
                            <div style={{ fontSize: 'var(--font-size-xl)', fontWeight: '700' }}>
                                R$ {data.currentValue?.toFixed(2) || '0,00'}
                            </div>
                        </div>
                    </div>
                    <div className="card" style={{
                        background: 'linear-gradient(135deg, var(--primary-orange) 0%, var(--primary-orange-dark) 100%)',
                        color: 'var(--white)',
                        border: 'none'
                    }}>
                        <div style={{ textAlign: 'center' }}>
                            <div style={{ fontSize: 'var(--font-size-sm)', opacity: 0.9 }}>
                                Lucro/Prejuízo
                            </div>
                            <div style={{ fontSize: 'var(--font-size-xl)', fontWeight: '700' }}>
                                R$ {data.profitLoss?.toFixed(2) || '0,00'}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="page-container">
            <div className="container">
                <div className="page-header fade-in">
                    <h1 className="page-title text-primary">📊 Relatórios</h1>
                    <p className="page-subtitle">Acompanhe seus dados financeiros</p>
                </div>

                <div className="card fade-in">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--spacing-6)' }}>
                        <h2>Relatórios Disponíveis</h2>
                        <button
                            type="button"
                            onClick={() => navigate('/dashboard')}
                            className="btn btn-secondary btn-sm"
                        >
                            ← Voltar
                        </button>
                    </div>

                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                        gap: 'var(--spacing-4)',
                        marginBottom: 'var(--spacing-6)'
                    }}>
                        <button
                            onClick={handleTaxReport}
                            className="btn btn-primary"
                            disabled={loading}
                        >
                            📋 Relatório de IR
                        </button>
                        <button
                            onClick={handlePortfolio}
                            className="btn btn-success"
                            disabled={loading}
                        >
                            💼 Meu Portfólio
                        </button>
                        <button
                            onClick={handleInvestmentsReport}
                            className="btn btn-secondary"
                            disabled={loading}
                        >
                            📈 Relatório de Investimentos
                        </button>
                        <button
                            onClick={handleTransactionsReport}
                            className="btn btn-primary"
                            disabled={loading}
                        >
                            💳 Extrato de Transações
                        </button>
                    </div>

                    {/* Filtros para relatórios específicos */}
                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                        gap: 'var(--spacing-4)',
                        marginBottom: 'var(--spacing-6)'
                    }}>
                        <div className="form-group">
                            <label className="form-label">Ano (IR)</label>
                            <select
                                value={selectedYear}
                                onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                                className="form-select"
                            >
                                {Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i).map(year => (
                                    <option key={year} value={year}>{year}</option>
                                ))}
                            </select>
                        </div>
                        <div className="form-group">
                            <label className="form-label">Data Inicial</label>
                            <input
                                type="date"
                                value={dateFrom}
                                onChange={(e) => setDateFrom(e.target.value)}
                                className="form-input"
                            />
                        </div>
                        <div className="form-group">
                            <label className="form-label">Data Final</label>
                            <input
                                type="date"
                                value={dateTo}
                                onChange={(e) => setDateTo(e.target.value)}
                                className="form-input"
                            />
                        </div>
                    </div>

                    {loading && (
                        <div className="loading">
                            Gerando relatório...
                        </div>
                    )}

                    {error && (
                        <div className="form-error text-center mb-4">
                            {error}
                        </div>
                    )}

                    {report && (
                        <div className="fade-in">
                            {report.type === 'tax' && renderTaxReport(report.data)}
                            {report.type === 'transactions' && renderTransactionsReport(report.data)}
                            {report.type === 'portfolio' && renderPortfolio(report.data)}
                            {report.type === 'investments' && renderInvestmentsReport(report.data)}
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
} 