import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { buyAssetSchema } from './schema'
import type { BuyAssetSchema } from './schema'
import { useEffect, useState } from 'react'
import { getAccounts, getAssets, buyAsset } from '../../api/account'
import type { Account, Asset } from '../../api/account'
import { useNavigate } from 'react-router-dom'
import Input from '../../components/Form/Input'

export default function BuyAssetPage() {
    const navigate = useNavigate()
    const [accounts, setAccounts] = useState<Account[]>([])
    const [assets, setAssets] = useState<Asset[]>([])
    const [apiError, setApiError] = useState('')
    const [loading, setLoading] = useState(true)
    const [isSubmitting, setIsSubmitting] = useState(false)

    const {
        register,
        handleSubmit,
        watch,
        formState: { errors },
    } = useForm<BuyAssetSchema>({
        resolver: zodResolver(buyAssetSchema),
        defaultValues: {
            quantity: ''
        }
    })

    const quantity = watch('quantity')
    const assetId = watch('assetId')

    useEffect(() => {
        const fetchData = async () => {
            try {
                const acc = await getAccounts()
                const investAcc = acc.filter(a => a.type === 2) // type 2 = Investimento
                setAccounts(investAcc)
                const assets = await getAssets()
                // Garantir que os ativos tenham as propriedades necessárias
                const validAssets = assets.filter(asset => asset && asset.id && asset.name)
                setAssets(validAssets)
            } catch (err) {
                console.error(err)
                setApiError('Erro ao carregar dados.')
            } finally {
                setLoading(false)
            }
        }
        fetchData()
    }, [])

    const onSubmit = async (data: BuyAssetSchema) => {
        setApiError('')
        setIsSubmitting(true)

        const investAcc = accounts[0]
        if (!investAcc) {
            setApiError('Conta investimento não encontrada.')
            setIsSubmitting(false)
            return
        }

        const asset = assets.find(a => a.id === data.assetId)
        if (!asset) {
            setApiError('Ativo não encontrado.')
            setIsSubmitting(false)
            return
        }

        const quantityNum = parseInt(data.quantity)
        if (isNaN(quantityNum) || quantityNum <= 0) {
            setApiError('Digite uma quantidade válida maior que zero.')
            setIsSubmitting(false)
            return
        }

        const total = (asset.currentPrice || 0) * quantityNum
        if (total > investAcc.balance) {
            setApiError('Saldo insuficiente na conta investimento.')
            setIsSubmitting(false)
            return
        }

        try {
            await buyAsset(investAcc.id, asset.id, quantityNum)
            navigate('/dashboard')
        } catch (err) {
            console.error(err)
            setApiError('Erro ao realizar compra.')
        } finally {
            setIsSubmitting(false)
        }
    }

    if (loading) {
        return (
            <div className="page-container">
                <div className="container">
                    <div className="loading">
                        Carregando...
                    </div>
                </div>
            </div>
        )
    }

    const selectedAsset = assets.find(a => a.id === assetId)
    const quantityNum = parseInt(quantity) || 0
    const totalValue = selectedAsset ? (selectedAsset.currentPrice || 0) * quantityNum : 0

    return (
        <div className="page-container">
            <div className="container">
                <div className="page-header fade-in">
                    <h1 className="page-title text-primary">📈 Comprar Ativos</h1>
                    <p className="page-subtitle">Invista em ativos financeiros</p>
                </div>

                <div className="card fade-in" style={{ maxWidth: '600px', margin: '0 auto' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--spacing-6)' }}>
                        <h2>Investimento</h2>
                        <button
                            type="button"
                            onClick={() => navigate('/dashboard')}
                            className="btn btn-secondary btn-sm"
                        >
                            ← Voltar
                        </button>
                    </div>

                    {accounts.length > 0 && (
                        <div className="card mb-6" style={{
                            background: 'linear-gradient(135deg, var(--info) 0%, #2563eb 100%)',
                            color: 'var(--white)',
                            border: 'none'
                        }}>
                            <div style={{ textAlign: 'center' }}>
                                <div style={{
                                    fontSize: 'var(--font-size-sm)',
                                    opacity: 0.9,
                                    marginBottom: 'var(--spacing-2)'
                                }}>
                                    Conta Investimento
                                </div>
                                <div style={{
                                    fontSize: 'var(--font-size-2xl)',
                                    fontWeight: '700'
                                }}>
                                    R$ {accounts[0].balance.toFixed(2)}
                                </div>
                                <div style={{
                                    fontSize: 'var(--font-size-sm)',
                                    opacity: 0.9,
                                    marginTop: 'var(--spacing-2)'
                                }}>
                                    Saldo disponível
                                </div>
                            </div>
                        </div>
                    )}

                    <form onSubmit={handleSubmit(onSubmit)}>
                        <div className="form-group">
                            <label className="form-label">Ativo</label>
                            <select {...register('assetId')} className="form-select">
                                <option value="">Selecione um ativo</option>
                                {assets.map(a => (
                                    <option key={a.id} value={a.id}>
                                        {a.name} - R$ {(a.currentPrice || 0).toFixed(2)}
                                    </option>
                                ))}
                            </select>
                            {errors.assetId && (
                                <div className="form-error">{errors.assetId.message}</div>
                            )}
                        </div>

                        <Input
                            label="Quantidade"
                            type="number"
                            step="1"
                            placeholder="Digite a quantidade"
                            {...register('quantity')}
                            error={errors.quantity}
                        />

                        {selectedAsset && quantityNum > 0 && (
                            <div className="card mb-6" style={{
                                background: 'var(--gray-50)',
                                border: '2px solid var(--gray-200)'
                            }}>
                                <div className="card-header">
                                    <h3 className="card-title">Resumo da Compra</h3>
                                </div>
                                <div style={{
                                    display: 'grid',
                                    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                                    gap: 'var(--spacing-4)'
                                }}>
                                    <div>
                                        <div style={{ fontSize: 'var(--font-size-sm)', color: 'var(--gray-600)' }}>
                                            Ativo
                                        </div>
                                        <div style={{ fontWeight: '600' }}>
                                            {selectedAsset.name}
                                        </div>
                                    </div>
                                    <div>
                                        <div style={{ fontSize: 'var(--font-size-sm)', color: 'var(--gray-600)' }}>
                                            Preço unitário
                                        </div>
                                        <div style={{ fontWeight: '600' }}>
                                            R$ {(selectedAsset.currentPrice || 0).toFixed(2)}
                                        </div>
                                    </div>
                                    <div>
                                        <div style={{ fontSize: 'var(--font-size-sm)', color: 'var(--gray-600)' }}>
                                            Quantidade
                                        </div>
                                        <div style={{ fontWeight: '600' }}>
                                            {quantityNum}
                                        </div>
                                    </div>
                                    <div>
                                        <div style={{ fontSize: 'var(--font-size-sm)', color: 'var(--gray-600)' }}>
                                            Total
                                        </div>
                                        <div style={{
                                            fontWeight: '700',
                                            fontSize: 'var(--font-size-lg)',
                                            color: 'var(--primary-orange)'
                                        }}>
                                            R$ {totalValue.toFixed(2)}
                                        </div>
                                    </div>
                                </div>

                                {accounts.length > 0 && (
                                    <div style={{
                                        marginTop: 'var(--spacing-4)',
                                        padding: 'var(--spacing-3)',
                                        borderRadius: 'var(--border-radius)',
                                        backgroundColor: totalValue > accounts[0].balance ? 'var(--error)' : 'var(--success)',
                                        color: 'var(--white)',
                                        textAlign: 'center'
                                    }}>
                                        <div style={{ fontWeight: '600' }}>
                                            Saldo após compra: R$ {(accounts[0].balance - totalValue).toFixed(2)}
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}

                        {apiError && (
                            <div className="form-error text-center mb-4">
                                {apiError}
                            </div>
                        )}

                        <button
                            type="submit"
                            className="btn btn-success btn-full"
                            disabled={isSubmitting || !selectedAsset || quantityNum <= 0}
                        >
                            {isSubmitting ? 'Processando...' : 'Confirmar Compra'}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    )
} 