import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { withdrawSchema } from './schema'
import type { WithdrawSchema } from './schema'
import { useEffect, useState } from 'react'
import { getAccounts, withdraw } from '../../api/account'
import type { Account } from '../../api/account'
import { useNavigate } from 'react-router-dom'

export default function WithdrawPage() {
    const navigate = useNavigate()
    const [currentAccount, setCurrentAccount] = useState<Account | null>(null)
    const [apiError, setApiError] = useState('')
    const [loading, setLoading] = useState(true)

    const {
        register,
        handleSubmit,
        formState: { errors }
    } = useForm<WithdrawSchema>({
        resolver: zodResolver(withdrawSchema),
        defaultValues: {
            amount: ''
        }
    })



    useEffect(() => {
        const fetchCurrentAccount = async () => {
            try {
                const accounts = await getAccounts()
                // Busca a única conta corrente (type: 1)
                const current = accounts.find(a => a.type === 1)
                if (current) {
                    setCurrentAccount(current)
                } else {
                    setApiError('Conta corrente não encontrada.')
                }
            } catch (err) {
                console.error(err)
                setApiError('Erro ao buscar conta.')
            } finally {
                setLoading(false)
            }
        }
        fetchCurrentAccount()
    }, [])

    const onSubmit = async (data: WithdrawSchema) => {
        setApiError('')
        if (!currentAccount) {
            setApiError('Conta não encontrada.')
            return
        }

        const amount = parseFloat(data.amount)
        if (isNaN(amount) || amount <= 0) {
            setApiError('Digite um valor válido maior que zero.')
            return
        }

        if (amount > currentAccount.balance) {
            setApiError('O valor não pode ser maior que o saldo disponível.')
            return
        }

        try {
            await withdraw(currentAccount.id, amount)
            navigate('/dashboard')
        } catch (err) {
            console.error('Erro no saque:', err)
            setApiError('Erro ao realizar saque.')
        }
    }

    if (loading) return <p>Carregando contas...</p>

    return (
        <div style={{ maxWidth: '400px', margin: '0 auto', padding: '2rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <h1>Sacar</h1>
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
            <form onSubmit={handleSubmit(onSubmit)}>
                {currentAccount && (
                    <div style={{ marginBottom: '1rem', padding: '1rem', backgroundColor: '#f8f9fa', borderRadius: '4px' }}>
                        <p><strong>Conta Corrente:</strong> {currentAccount.id.substring(0, 8)}...</p>
                        <p><strong>Saldo disponível:</strong> R$ {currentAccount.balance.toFixed(2)}</p>
                    </div>
                )}

                <div style={{ marginBottom: '1rem' }}>
                    <label>Valor do Saque</label>
                    <input
                        type="number"
                        step="0.01"
                        placeholder="Digite o valor"
                        {...register('amount')}
                        style={{ width: '100%', padding: '0.5rem' }}
                    />
                    {errors.amount && (
                        <span style={{ color: 'red' }}>{errors.amount.message}</span>
                    )}
                </div>

                {apiError && (
                    <div style={{ color: 'red', marginBottom: '1rem' }}>{apiError}</div>
                )}

                <button
                    type="submit"
                    style={{
                        width: '100%',
                        padding: '.75rem',
                        background: '#dc3545',
                        color: '#fff',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer'
                    }}
                >
                    Confirmar Saque
                </button>
            </form>
        </div>
    )
} 