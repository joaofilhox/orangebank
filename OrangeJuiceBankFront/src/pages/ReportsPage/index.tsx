import { useState, useEffect } from 'react'
import { getTaxReport, getInvestmentReport, getAccounts, getTransactionsReport, getPortfolio } from '../../api/account'
import type { Account, Transaction, TaxReport, InvestmentReport, PortfolioItem } from '../../api/account'
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
        <div>
            <h3>Relatório de Imposto de Renda - {data.year}</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                <div style={{ padding: '1rem', backgroundColor: '#f8f9fa', borderRadius: '4px' }}>
                    <strong>Renda Tributável:</strong> R$ {data.taxableIncome?.toFixed(2) || '0,00'}
                </div>
                <div style={{ padding: '1rem', backgroundColor: '#f8f9fa', borderRadius: '4px' }}>
                    <strong>Imposto Total:</strong> R$ {data.totalTax?.toFixed(2) || '0,00'}
                </div>
            </div>
            {data.transactions && data.transactions.length > 0 && (
                <div>
                    <h4>Transações do Ano</h4>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                            <tr style={{ backgroundColor: '#e9ecef' }}>
                                <th style={{ padding: '0.5rem', border: '1px solid #dee2e6', textAlign: 'left' }}>Data</th>
                                <th style={{ padding: '0.5rem', border: '1px solid #dee2e6', textAlign: 'left' }}>Tipo</th>
                                <th style={{ padding: '0.5rem', border: '1px solid #dee2e6', textAlign: 'left' }}>Valor</th>
                            </tr>
                        </thead>
                        <tbody>
                            {data.transactions.map((tx: any, index: number) => (
                                <tr key={index}>
                                    <td style={{ padding: '0.5rem', border: '1px solid #dee2e6' }}>
                                        {new Date(tx.date).toLocaleDateString('pt-BR')}
                                    </td>
                                    <td style={{ padding: '0.5rem', border: '1px solid #dee2e6' }}>{tx.type}</td>
                                    <td style={{ padding: '0.5rem', border: '1px solid #dee2e6' }}>
                                        R$ {tx.amount?.toFixed(2) || '0,00'}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    )

    const renderTransactionsReport = (data: Transaction[]) => (
        <div>
            <h3>Extrato da Conta Corrente</h3>
            <div style={{ marginBottom: '1rem' }}>
                <strong>Total de transações:</strong> {data.length}
            </div>
            {data.length > 0 ? (
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                        <tr style={{ backgroundColor: '#e9ecef' }}>
                            <th style={{ padding: '0.5rem', border: '1px solid #dee2e6', textAlign: 'left' }}>Data</th>
                            <th style={{ padding: '0.5rem', border: '1px solid #dee2e6', textAlign: 'left' }}>Tipo</th>
                            <th style={{ padding: '0.5rem', border: '1px solid #dee2e6', textAlign: 'left' }}>Descrição</th>
                            <th style={{ padding: '0.5rem', border: '1px solid #dee2e6', textAlign: 'right' }}>Valor</th>
                        </tr>
                    </thead>
                    <tbody>
                        {data.map((tx) => (
                            <tr key={tx.id}>
                                <td style={{ padding: '0.5rem', border: '1px solid #dee2e6' }}>
                                    {new Date(tx.date).toLocaleDateString('pt-BR')}
                                </td>
                                <td style={{ padding: '0.5rem', border: '1px solid #dee2e6' }}>{tx.type}</td>
                                <td style={{ padding: '0.5rem', border: '1px solid #dee2e6' }}>{tx.description}</td>
                                <td style={{
                                    padding: '0.5rem',
                                    border: '1px solid #dee2e6',
                                    textAlign: 'right',
                                    color: tx.amount >= 0 ? 'green' : 'red'
                                }}>
                                    R$ {tx.amount.toFixed(2)}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            ) : (
                <p>Nenhuma transação encontrada.</p>
            )}
        </div>
    )

    const renderPortfolio = (data: PortfolioItem[]) => {
        if (!data || data.length === 0) {
            return (
                <div>
                    <h3>Meus Investimentos</h3>
                    <p>Nenhum investimento encontrado no portfólio.</p>
                </div>
            )
        }

        return (
            <div>
                <h3>Meus Investimentos Atuais</h3>
                <div style={{ marginBottom: '1rem' }}>
                    <strong>Total de ativos:</strong> {data.length}
                </div>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                        <tr style={{ backgroundColor: '#e9ecef' }}>
                            <th style={{ padding: '0.5rem', border: '1px solid #dee2e6', textAlign: 'left' }}>Ativo</th>
                            <th style={{ padding: '0.5rem', border: '1px solid #dee2e6', textAlign: 'left' }}>Tipo</th>
                            <th style={{ padding: '0.5rem', border: '1px solid #dee2e6', textAlign: 'right' }}>Quantidade</th>
                            <th style={{ padding: '0.5rem', border: '1px solid #dee2e6', textAlign: 'right' }}>Preço Médio</th>
                            <th style={{ padding: '0.5rem', border: '1px solid #dee2e6', textAlign: 'right' }}>Preço Atual</th>
                            <th style={{ padding: '0.5rem', border: '1px solid #dee2e6', textAlign: 'right' }}>Valor Total</th>
                            <th style={{ padding: '0.5rem', border: '1px solid #dee2e6', textAlign: 'right' }}>L/P</th>
                        </tr>
                    </thead>
                    <tbody>
                        {data.map((item) => {
                            const avgPrice = item.averagePrice || 0
                            const currentPrice = item.currentPrice || 0
                            const qty = item.quantity || 0
                            const itemTotalValue = currentPrice * qty
                            const itemProfitLoss = itemTotalValue - (avgPrice * qty)

                            return (
                                <tr key={item.investmentId}>
                                    <td style={{ padding: '0.5rem', border: '1px solid #dee2e6' }}>{item.assetName || 'N/A'}</td>
                                    <td style={{ padding: '0.5rem', border: '1px solid #dee2e6' }}>{item.assetType || 'N/A'}</td>
                                    <td style={{ padding: '0.5rem', border: '1px solid #dee2e6', textAlign: 'right' }}>{qty}</td>
                                    <td style={{ padding: '0.5rem', border: '1px solid #dee2e6', textAlign: 'right' }}>
                                        R$ {avgPrice.toFixed(2)}
                                    </td>
                                    <td style={{ padding: '0.5rem', border: '1px solid #dee2e6', textAlign: 'right' }}>
                                        R$ {currentPrice.toFixed(2)}
                                    </td>
                                    <td style={{ padding: '0.5rem', border: '1px solid #dee2e6', textAlign: 'right' }}>
                                        R$ {itemTotalValue.toFixed(2)}
                                    </td>
                                    <td style={{
                                        padding: '0.5rem',
                                        border: '1px solid #dee2e6',
                                        textAlign: 'right',
                                        color: itemProfitLoss >= 0 ? 'green' : 'red'
                                    }}>
                                        R$ {itemProfitLoss.toFixed(2)}
                                    </td>
                                </tr>
                            )
                        })}
                    </tbody>
                </table>
            </div>
        )
    }

    const renderInvestmentsReport = (data: any) => {
        if (!data || !Array.isArray(data) || data.length === 0) {
            return (
                <div>
                    <h3>Resumo de Investimentos</h3>
                    <p>Nenhum investimento encontrado.</p>
                </div>
            )
        }

        // Calcular valores totais
        const totalInvested = data.reduce((sum: number, item: any) => sum + (item.totalInvested || 0), 0)
        const currentValue = data.reduce((sum: number, item: any) => sum + (item.currentValue || 0), 0)
        const totalProfitLoss = data.reduce((sum: number, item: any) => sum + (item.profit || 0), 0)
        const profitLossPercentage = totalInvested > 0 ? (totalProfitLoss / totalInvested) * 100 : 0

        return (
            <div>
                <h3>Resumo de Investimentos</h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
                    <div style={{ padding: '1rem', backgroundColor: '#f8f9fa', borderRadius: '4px' }}>
                        <strong>Total Investido:</strong><br />
                        R$ {totalInvested.toFixed(2)}
                    </div>
                    <div style={{ padding: '1rem', backgroundColor: '#f8f9fa', borderRadius: '4px' }}>
                        <strong>Valor Atual:</strong><br />
                        R$ {currentValue.toFixed(2)}
                    </div>
                    <div style={{
                        padding: '1rem',
                        backgroundColor: '#f8f9fa',
                        borderRadius: '4px',
                        color: totalProfitLoss >= 0 ? 'green' : 'red'
                    }}>
                        <strong>Lucro/Prejuízo:</strong><br />
                        R$ {totalProfitLoss.toFixed(2)}
                    </div>
                    <div style={{
                        padding: '1rem',
                        backgroundColor: '#f8f9fa',
                        borderRadius: '4px',
                        color: profitLossPercentage >= 0 ? 'green' : 'red'
                    }}>
                        <strong>Rentabilidade:</strong><br />
                        {profitLossPercentage.toFixed(2)}%
                    </div>
                </div>

                <div>
                    <h4>Detalhamento por Ativo</h4>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                            <tr style={{ backgroundColor: '#e9ecef' }}>
                                <th style={{ padding: '0.5rem', border: '1px solid #dee2e6', textAlign: 'left' }}>Ativo</th>
                                <th style={{ padding: '0.5rem', border: '1px solid #dee2e6', textAlign: 'left' }}>Tipo</th>
                                <th style={{ padding: '0.5rem', border: '1px solid #dee2e6', textAlign: 'right' }}>Quantidade</th>
                                <th style={{ padding: '0.5rem', border: '1px solid #dee2e6', textAlign: 'right' }}>Preço Médio</th>
                                <th style={{ padding: '0.5rem', border: '1px solid #dee2e6', textAlign: 'right' }}>Preço Atual</th>
                                <th style={{ padding: '0.5rem', border: '1px solid #dee2e6', textAlign: 'right' }}>Total Investido</th>
                                <th style={{ padding: '0.5rem', border: '1px solid #dee2e6', textAlign: 'right' }}>Valor Atual</th>
                                <th style={{ padding: '0.5rem', border: '1px solid #dee2e6', textAlign: 'right' }}>L/P</th>
                            </tr>
                        </thead>
                        <tbody>
                            {data.map((item: any, index: number) => (
                                <tr key={index}>
                                    <td style={{ padding: '0.5rem', border: '1px solid #dee2e6' }}>{item.assetName || 'N/A'}</td>
                                    <td style={{ padding: '0.5rem', border: '1px solid #dee2e6' }}>{item.assetType === 0 ? 'Ação' : item.assetType === 1 ? 'CDB' : 'Tesouro'}</td>
                                    <td style={{ padding: '0.5rem', border: '1px solid #dee2e6', textAlign: 'right' }}>{item.quantity || 0}</td>
                                    <td style={{ padding: '0.5rem', border: '1px solid #dee2e6', textAlign: 'right' }}>
                                        R$ {(item.averagePrice || 0).toFixed(2)}
                                    </td>
                                    <td style={{ padding: '0.5rem', border: '1px solid #dee2e6', textAlign: 'right' }}>
                                        R$ {(item.currentPrice || 0).toFixed(2)}
                                    </td>
                                    <td style={{ padding: '0.5rem', border: '1px solid #dee2e6', textAlign: 'right' }}>
                                        R$ {(item.totalInvested || 0).toFixed(2)}
                                    </td>
                                    <td style={{ padding: '0.5rem', border: '1px solid #dee2e6', textAlign: 'right' }}>
                                        R$ {(item.currentValue || 0).toFixed(2)}
                                    </td>
                                    <td style={{
                                        padding: '0.5rem',
                                        border: '1px solid #dee2e6',
                                        textAlign: 'right',
                                        color: (item.profit || 0) >= 0 ? 'green' : 'red'
                                    }}>
                                        R$ {(item.profit || 0).toFixed(2)}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        )
    }

    return (
        <div style={{ padding: '2rem', maxWidth: '1000px', margin: '0 auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <h1>Relatórios Financeiros</h1>
                <button
                    type="button"
                    onClick={() => navigate('/dashboard')}
                    style={{
                        padding: '0.5rem 1rem',
                        background: '#6c757d',
                        color: '#fff',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer'
                    }}
                >
                    Voltar
                </button>
            </div>

            <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem', flexWrap: 'wrap' }}>
                <button onClick={handleTaxReport} style={btnStyle}>
                    📊 Relatório IR
                </button>
                <button onClick={handleTransactionsReport} style={btnStyle}>
                    📋 Extrato Conta Corrente
                </button>
                <button onClick={handlePortfolio} style={btnStyle}>
                    💼 Meus Investimentos
                </button>
                <button onClick={handleInvestmentsReport} style={btnStyle}>
                    📈 Resumo Investimentos
                </button>
            </div>

            {/* Filtros */}
            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                gap: '1rem',
                marginBottom: '2rem',
                padding: '1rem',
                backgroundColor: '#f8f9fa',
                borderRadius: '8px'
            }}>
                <div>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
                        Ano para Relatório IR:
                    </label>
                    <select
                        value={selectedYear}
                        onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                        style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1px solid #ddd' }}
                    >
                        {Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i).map(year => (
                            <option key={year} value={year}>{year}</option>
                        ))}
                    </select>
                </div>

                <div>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
                        Data Inicial (Extrato):
                    </label>
                    <input
                        type="date"
                        value={dateFrom}
                        onChange={(e) => setDateFrom(e.target.value)}
                        style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1px solid #ddd' }}
                    />
                </div>

                <div>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
                        Data Final (Extrato):
                    </label>
                    <input
                        type="date"
                        value={dateTo}
                        onChange={(e) => setDateTo(e.target.value)}
                        style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1px solid #ddd' }}
                    />
                </div>
            </div>

            {loading && (
                <div style={{ textAlign: 'center', padding: '2rem' }}>
                    <p>Carregando relatório...</p>
                </div>
            )}

            {error && (
                <div style={{ color: 'red', padding: '1rem', backgroundColor: '#f8d7da', borderRadius: '4px', marginBottom: '1rem' }}>
                    {error}
                </div>
            )}

            {report && (
                <div style={{ marginTop: '2rem', padding: '1rem', backgroundColor: '#fff', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
                    {report.type === 'tax' && renderTaxReport(report.data)}
                    {report.type === 'transactions' && renderTransactionsReport(report.data)}
                    {report.type === 'portfolio' && renderPortfolio(report.data)}
                    {report.type === 'investments' && renderInvestmentsReport(report.data)}
                </div>
            )}
        </div>
    )
}

const btnStyle: React.CSSProperties = {
    padding: '0.75rem 1.5rem',
    background: '#007bff',
    color: '#fff',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '1rem'
} 