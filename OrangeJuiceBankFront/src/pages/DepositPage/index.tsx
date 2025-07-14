import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { depositSchema } from './schema'
import type { DepositSchema } from './schema'
import { useEffect, useState } from 'react'
import { getAccounts, deposit } from '../../api/account'
import type { Account } from '../../api/account'
import { useNavigate } from 'react-router-dom'
import Input from '../../components/Form/Input'

export default function DepositPage() {
    const navigate = useNavigate()
    const [currentAccount, setCurrentAccount] = useState<Account | null>(null)
    const [apiError, setApiError] = useState('')
    const [loading, setLoading] = useState(true)
    const [isSubmitting, setIsSubmitting] = useState(false)

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
        setIsSubmitting(true)

        if (!currentAccount) {
            setApiError('Conta não encontrada.')
            setIsSubmitting(false)
            return
        }

        try {
            await deposit(currentAccount.id, data.amount)
            navigate('/dashboard')
        } catch (err) {
            console.error(err)
            setApiError('Erro ao realizar depósito.')
        } finally {
            setIsSubmitting(false)
        }
    }

    if (loading) {
        return (
            <div className="page-container">
                <div className="container">
                    <div className="loading">
                        Carregando contas...
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="page-container">
            <div className="container">
                <div className="page-header fade-in">
                    <h1 className="page-title text-primary">💰 Depositar</h1>
                    <p className="page-subtitle">Adicione dinheiro à sua conta</p>
                </div>

                <div className="card fade-in" style={{ maxWidth: '500px', margin: '0 auto' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--spacing-6)' }}>
                        <h2>Depósito</h2>
                        <button
                            type="button"
                            onClick={() => navigate('/dashboard')}
                            className="btn btn-secondary btn-sm"
                        >
                            ← Voltar
                        </button>
                    </div>

                    {currentAccount && (
                        <div className="card mb-6" style={{
                            background: 'linear-gradient(135deg, var(--success) 0%, #059669 100%)',
                            color: 'var(--white)',
                            border: 'none'
                        }}>
                            <div style={{ textAlign: 'center' }}>
                                <div style={{
                                    fontSize: 'var(--font-size-sm)',
                                    opacity: 0.9,
                                    marginBottom: 'var(--spacing-2)'
                                }}>
                                    Conta Corrente
                                </div>
                                <div style={{
                                    fontSize: 'var(--font-size-lg)',
                                    fontWeight: '600',
                                    marginBottom: 'var(--spacing-2)'
                                }}>
                                    {currentAccount.id.substring(0, 8)}...
                                </div>
                                <div style={{
                                    fontSize: 'var(--font-size-2xl)',
                                    fontWeight: '700'
                                }}>
                                    R$ {currentAccount.balance.toFixed(2)}
                                </div>
                                <div style={{
                                    fontSize: 'var(--font-size-sm)',
                                    opacity: 0.9,
                                    marginTop: 'var(--spacing-2)'
                                }}>
                                    Saldo atual
                                </div>
                            </div>
                        </div>
                    )}

                    <form onSubmit={handleSubmit(onSubmit)}>
                        <Input
                            label="Valor do Depósito"
                            type="number"
                            step="0.01"
                            placeholder="Digite o valor"
                            {...register('amount', { valueAsNumber: true })}
                            error={errors.amount}
                        />

                        {apiError && (
                            <div className="form-error text-center mb-4">
                                {apiError}
                            </div>
                        )}

                        <button
                            type="submit"
                            className="btn btn-success btn-full"
                            disabled={isSubmitting}
                        >
                            {isSubmitting ? 'Processando...' : 'Confirmar Depósito'}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    )
} 