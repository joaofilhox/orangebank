import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { transferSchema } from './schema'
import type { TransferSchema } from './schema'
import { useEffect, useState } from 'react'
import { getAccounts, transfer } from '../../api/account'
import type { Account } from '../../api/account'
import { useNavigate } from 'react-router-dom'

export default function TransferPage() {
    const navigate = useNavigate()
    const [accounts, setAccounts] = useState<Account[]>([])
    const [apiError, setApiError] = useState('')
    const [loading, setLoading] = useState(true)

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
    const sourceAccountId = watch('sourceAccountId')

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

        const source = accounts.find(a => a.id === data.sourceAccountId)
        if (!source) {
            setApiError('Conta de origem inválida.')
            return
        }

        const amount = parseFloat(data.amount)
        if (isNaN(amount) || amount <= 0) {
            setApiError('Digite um valor válido maior que zero.')
            return
        }

        if (source.type === 2 && data.transferType === 'external') {
            setApiError('Não é permitido transferir de Conta Investimento para outro usuário.')
            return
        }

        if (amount > source.balance) {
            setApiError('O valor não pode exceder o saldo da conta de origem.')
            return
        }

        if (data.transferType === 'self') {
            // Entre contas próprias
            const destType = source.type === 1 ? 2 : 1 // 1 = Corrente, 2 = Investimento
            const dest = accounts.find(a => a.type === destType)

            if (!dest) {
                setApiError('Conta destino não encontrada.')
                return
            }

            // ⚠️ Aqui você pode validar se a conta investimento tem operações pendentes (placeholder)
            // if (source.type === 2 /* && source.hasPendingOperations*/) {
            //     setApiError('Não é permitido transferir da Conta Investimento com operações pendentes.')
            //     return
            // }

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
            }

        } else {
            // Transferência para outro usuário
            if (!data.destinationAccountId) {
                setApiError('Informe o número da conta destino.')
                return
            }

            try {
                await transfer({
                    sourceAccountId: source.id,
                    destinationAccountId: data.destinationAccountId,
                    amount: amount
                })
                navigate('/dashboard')
            } catch (err) {
                console.error(err)
                setApiError('Erro ao realizar transferência.')
            }
        }
    }

    if (loading) return <p>Carregando contas...</p>

    return (
        <div style={{ maxWidth: '500px', margin: '0 auto', padding: '2rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <h1>Transferir</h1>
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
                <div style={{ marginBottom: '1rem' }}>
                    <label>Tipo de Transferência</label>
                    <select {...register('transferType')} style={{ width: '100%', padding: '0.5rem' }}>
                        <option value="self">Entre minhas contas</option>
                        <option value="external">Para outro usuário</option>
                    </select>
                    {errors.transferType && (
                        <span style={{ color: 'red' }}>{errors.transferType.message}</span>
                    )}
                </div>

                <div style={{ marginBottom: '1rem' }}>
                    <label>Conta de Origem</label>
                    <select {...register('sourceAccountId')} style={{ width: '100%', padding: '0.5rem' }}>
                        <option value="">Selecione uma conta</option>
                        {accounts.map(acc => (
                            <option key={acc.id} value={acc.id}>
                                {acc.type === 1 ? 'Corrente' : 'Investimento'} - Saldo: R$ {acc.balance.toFixed(2)}
                            </option>
                        ))}
                    </select>
                    {errors.sourceAccountId && (
                        <span style={{ color: 'red' }}>{errors.sourceAccountId.message}</span>
                    )}
                </div>

                {transferType === 'external' && (
                    <div style={{ marginBottom: '1rem' }}>
                        <label>Número da Conta Destino</label>
                        <input
                            type="text"
                            placeholder="Digite o número da conta destino"
                            {...register('destinationAccountId')}
                            style={{ width: '100%', padding: '0.5rem' }}
                        />
                        {errors.destinationAccountId && (
                            <span style={{ color: 'red' }}>{errors.destinationAccountId.message}</span>
                        )}
                    </div>
                )}

                <div style={{ marginBottom: '1rem' }}>
                    <label>Valor</label>
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
                        background: '#ffc107',
                        color: '#000',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer'
                    }}
                >
                    Confirmar Transferência
                </button>
            </form>
        </div>
    )
} 