import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { transferSchema } from './schema'
import type { TransferSchema } from './schema'
import { useEffect, useState } from 'react'
import { getAccounts, transfer, transferByEmail } from '../../api/account'
import type { Account } from '../../api/account'
import { useNavigate } from 'react-router-dom'
import Input from '../../components/Form/Input'

export default function TransferPage() {
    const navigate = useNavigate()
    const [accounts, setAccounts] = useState<Account[]>([])
    const [apiError, setApiError] = useState('')
    const [loading, setLoading] = useState(true)
    const [isSubmitting, setIsSubmitting] = useState(false)

    const {
        register,
        handleSubmit,
        watch,
        formState: { errors },
    } = useForm<TransferSchema>({
        resolver: zodResolver(transferSchema),
        defaultValues: {
            amount: '',
            transferType: 'self'
        }
    })

    const transferType = watch('transferType')

    useEffect(() => {
        const fetchAccounts = async () => {
            try {
                const acc = await getAccounts()
                setAccounts(acc)
            } catch (err) {
                console.error(err)
                setApiError('Erro ao buscar contas.')
            } finally {
                setLoading(false)
            }
        }
        fetchAccounts()
    }, [])

    const onSubmit = async (data: TransferSchema) => {
        setApiError('')
        setIsSubmitting(true)

        const source = accounts.find(a => a.id === data.sourceAccountId)
        if (!source) {
            setApiError('Conta de origem inválida.')
            setIsSubmitting(false)
            return
        }

        const amount = parseFloat(data.amount)
        if (isNaN(amount) || amount <= 0) {
            setApiError('Digite um valor válido maior que zero.')
            setIsSubmitting(false)
            return
        }

        if (source.type === 2 && data.transferType === 'external') {
            setApiError('Não é permitido transferir de Conta Investimento para outro usuário.')
            setIsSubmitting(false)
            return
        }

        if (amount > source.balance) {
            setApiError('O valor não pode exceder o saldo da conta de origem.')
            setIsSubmitting(false)
            return
        }

        if (data.transferType === 'self') {
            // Entre contas próprias
            const destType = source.type === 1 ? 2 : 1 // 1 = Corrente, 2 = Investimento
            const dest = accounts.find(a => a.type === destType)

            if (!dest) {
                setApiError('Conta destino não encontrada.')
                setIsSubmitting(false)
                return
            }

            try {
                await transfer({
                    sourceAccountId: source.id,
                    destinationAccountId: dest.id,
                    amount: amount
                })
                navigate('/dashboard')
            } catch (err) {
                console.error(err)
                setApiError('Erro ao realizar transferência.')
            } finally {
                setIsSubmitting(false)
            }

        } else {
            // Transferência para outro usuário
            if (!data.destinationAccountId) {
                setApiError('Informe o e-mail do destinatário.')
                setIsSubmitting(false)
                return
            }

            try {
                await transferByEmail({
                    sourceAccountId: source.id,
                    destinationEmail: data.destinationAccountId,
                    amount: amount
                })
                navigate('/dashboard')
            } catch (err) {
                console.error(err)
                setApiError('Erro ao realizar transferência.')
            } finally {
                setIsSubmitting(false)
            }
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
                    <h1 className="page-title text-primary">🔄 Transferir</h1>
                    <p className="page-subtitle">Transfira dinheiro entre contas</p>
                </div>

                <div className="card fade-in" style={{ maxWidth: '500px', margin: '0 auto' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--spacing-6)' }}>
                        <h2>Transferência</h2>
                        <button
                            type="button"
                            onClick={() => navigate('/dashboard')}
                            className="btn btn-secondary btn-sm"
                        >
                            ← Voltar
                        </button>
                    </div>

                    <form onSubmit={handleSubmit(onSubmit)}>
                        <div className="form-group">
                            <label className="form-label">Tipo de Transferência</label>
                            <select {...register('transferType')} className="form-select">
                                <option value="self">Entre minhas contas</option>
                                <option value="external">Para outro usuário</option>
                            </select>
                            {errors.transferType && (
                                <div className="form-error">{errors.transferType.message}</div>
                            )}
                        </div>

                        <div className="form-group">
                            <label className="form-label">Conta de Origem</label>
                            <select {...register('sourceAccountId')} className="form-select">
                                <option value="">Selecione uma conta</option>
                                {accounts.map(acc => (
                                    <option key={acc.id} value={acc.id}>
                                        {acc.type === 1 ? 'Corrente' : 'Investimento'} - Saldo: R$ {acc.balance.toFixed(2)}
                                    </option>
                                ))}
                            </select>
                            {errors.sourceAccountId && (
                                <div className="form-error">{errors.sourceAccountId.message}</div>
                            )}
                        </div>

                        {transferType === 'external' && (
                            <Input
                                label="E-mail do Destinatário"
                                type="email"
                                placeholder="Digite o e-mail do destinatário"
                                {...register('destinationAccountId')}
                                error={errors.destinationAccountId}
                            />
                        )}

                        <Input
                            label="Valor"
                            type="number"
                            step="0.01"
                            placeholder="Digite o valor"
                            {...register('amount')}
                            error={errors.amount}
                        />

                        {apiError && (
                            <div className="form-error text-center mb-4">
                                {apiError}
                            </div>
                        )}

                        <button
                            type="submit"
                            className="btn btn-primary btn-full"
                            disabled={isSubmitting}
                        >
                            {isSubmitting ? 'Processando...' : 'Confirmar Transferência'}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    )
} 