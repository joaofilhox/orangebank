interface BalanceCardProps {
    title: string
    amount: number
}

export default function BalanceCard({ title, amount }: BalanceCardProps) {
    const isPositive = amount >= 0
    const formattedAmount = new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL'
    }).format(Math.abs(amount))

    return (
        <div className="card" style={{
            background: `linear-gradient(135deg, ${isPositive ? 'var(--success)' : 'var(--error)'} 0%, ${isPositive ? '#059669' : '#dc2626'} 100%)`,
            color: 'var(--white)',
            border: 'none'
        }}>
            <div className="card-header" style={{ borderBottom: '1px solid rgba(255,255,255,0.2)' }}>
                <h3 className="card-title" style={{ color: 'var(--white)', marginBottom: 0 }}>
                    {title}
                </h3>
            </div>
            <div style={{ textAlign: 'center' }}>
                <div style={{
                    fontSize: 'var(--font-size-3xl)',
                    fontWeight: '700',
                    marginBottom: 'var(--spacing-2)'
                }}>
                    {isPositive ? '+' : '-'} {formattedAmount}
                </div>
                <div style={{
                    fontSize: 'var(--font-size-sm)',
                    opacity: 0.9
                }}>
                    Saldo atual
                </div>
            </div>
        </div>
    )
} 