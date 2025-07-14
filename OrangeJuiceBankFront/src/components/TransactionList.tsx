import type { Transaction } from '../api/account'

interface TransactionListProps {
    transactions: Transaction[]
}

export default function TransactionList({ transactions }: TransactionListProps) {
    if (transactions.length === 0) {
        return (
            <div className="text-center">
                <p className="text-muted">Nenhuma transação encontrada.</p>
            </div>
        )
    }

    return (
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
                    {transactions.map((tx) => (
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
    )
} 