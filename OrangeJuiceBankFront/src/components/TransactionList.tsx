import type { Transaction } from '../api/account'

interface Props {
    transactions: Transaction[]
}

export default function TransactionList({ transactions }: Props) {
    return (
        <div>
            <h3>Últimas 5 movimentações</h3>
            <ul style={{ listStyle: 'none', padding: 0 }}>
                {transactions.map((tx) => (
                    <li
                        key={tx.id}
                        style={{
                            borderBottom: '1px solid #eee',
                            padding: '0.5rem 0'
                        }}
                    >
                        <strong>{tx.type}</strong> - R$ {tx.amount.toFixed(2)}<br />
                        <small>{tx.description}</small><br />
                        <small>{new Date(tx.date).toLocaleDateString()}</small>
                    </li>
                ))}
            </ul>
        </div>
    )
} 