import { useAuth } from '../../hooks/useAuth'

export default function DashboardPage() {
    const { logout } = useAuth()
    return (
        <div style={{ padding: '2rem' }}>
            <h1>Dashboard</h1>
            <p>Bem-vindo! Você está logado.</p>
            <button
                onClick={logout}
                style={{
                    marginTop: '2rem',
                    padding: '.75rem 1.5rem',
                    background: '#dc3545',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer',
                }}
            >
                Sair
            </button>
        </div>
    )
} 