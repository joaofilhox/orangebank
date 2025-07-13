import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { depositSchema } from './schema'
import type { DepositSchema } from './schema'
import { useEffect, useState } from 'react'
import { getAccounts, deposit } from '../../api/account'
import type { Account } from '../../api/account'
import { useNavigate } from 'react-router-dom'

export default function DepositPage() {
    const navigate = useNavigate()
    const [currentAccount, setCurrentAccount] = useState<Account | null>(null)
    const [apiError, setApiError] = useState('')
    const [loading, setLoading] = useState(true)

    const {
        register,
        handleSubmit,
        formState: { errors }
    } = useForm<DepositSchema>({
        resolver: zodResolver(depositSchema),
        defaultValues: {
            amount: 0
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

    const onSubmit = async (data: DepositSchema) => {
        setApiError('')
        if (!currentAccount) {
            setApiError('Conta não encontrada.')
            return
        }
        try {
            await deposit(currentAccount.id, data.amount)
            navigate('/dashboard')
        } catch (err) {
            console.error(err)
            setApiError('Erro ao realizar depósito.')
        }
    }

    if (loading) return <p>Carregando contas...</p>

    return (
        <div style={{ maxWidth: '400px', margin: '0 auto', padding: '2rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <h1>Depositar</h1>
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
                        <p><strong>Saldo atual:</strong> R$ {currentAccount.balance.toFixed(2)}</p>
                    </div>
                )}

                <div style={{ marginBottom: '1rem' }}>
                    <label>Valor do Depósito</label>
                    <input
                        type="number"
                        step="0.01"
                        placeholder="Digite o valor"
                        {...register('amount', { valueAsNumber: true })}
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
                        background: '#28a745',
                        color: '#fff',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer'
                    }}
                >
                    Confirmar Depósito
                </button>
            </form>
        </div>
    )
} 