interface BalanceCardProps {
    title: string
    amount: number
}

export default function BalanceCard({ title, amount }: BalanceCardProps) {
    return (
        <div
            style={{
                border: '1px solid #ccc',
                padding: '1rem',
                borderRadius: '8px',
                minWidth: '200px',
                textAlign: 'center'
            }}
        >
            <h3>{title}</h3>
            <p style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>
                R$ {amount.toFixed(2)}
            </p>
        </div>
    )
} 