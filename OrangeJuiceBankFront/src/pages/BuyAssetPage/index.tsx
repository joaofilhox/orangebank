import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { buyAssetSchema } from './schema'
import type { BuyAssetSchema } from './schema'
import { useEffect, useState } from 'react'
import { getAccounts, getAssets, buyAsset } from '../../api/account'
import type { Account, Asset } from '../../api/account'
import { useNavigate } from 'react-router-dom'

export default function BuyAssetPage() {
    const navigate = useNavigate()
    const [accounts, setAccounts] = useState<Account[]>([])
    const [assets, setAssets] = useState<Asset[]>([])
    const [apiError, setApiError] = useState('')
    const [loading, setLoading] = useState(true)

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

        const investAcc = accounts[0]
        if (!investAcc) {
            setApiError('Conta investimento não encontrada.')
            return
        }

        const asset = assets.find(a => a.id === data.assetId)
        if (!asset) {
            setApiError('Ativo não encontrado.')
            return
        }

        const quantityNum = parseInt(data.quantity)
        if (isNaN(quantityNum) || quantityNum <= 0) {
            setApiError('Digite uma quantidade válida maior que zero.')
            return
        }

        const total = (asset.currentPrice || 0) * quantityNum
        if (total > investAcc.balance) {
            setApiError('Saldo insuficiente na conta investimento.')
            return
        }

        try {
            await buyAsset(investAcc.id, asset.id, quantityNum)
            navigate('/dashboard')
        } catch (err) {
            console.error(err)
            setApiError('Erro ao realizar compra.')
        }
    }

    if (loading) return <p>Carregando...</p>

    const selectedAsset = assets.find(a => a.id === assetId)
    const quantityNum = parseInt(quantity) || 0
    const totalValue = selectedAsset ? (selectedAsset.currentPrice || 0) * quantityNum : 0

    return (
        <div style={{ maxWidth: '500px', margin: '0 auto', padding: '2rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <h1>Comprar Ativos</h1>
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

            {accounts.length > 0 && (
                <div style={{ marginBottom: '2rem', padding: '1rem', backgroundColor: '#f8f9fa', borderRadius: '4px' }}>
                    <p><strong>Conta Investimento:</strong> R$ {accounts[0].balance.toFixed(2)}</p>
                </div>
            )}

            <form onSubmit={handleSubmit(onSubmit)}>
                <div style={{ marginBottom: '1rem' }}>
                    <label>Ativo</label>
                    <select {...register('assetId')} style={{ width: '100%', padding: '0.5rem' }}>
                        <option value="">Selecione um ativo</option>
                        {assets.map(a => (
                            <option key={a.id} value={a.id}>
                                {a.name} - R$ {(a.currentPrice || 0).toFixed(2)}
                            </option>
                        ))}
                    </select>
                    {errors.assetId && (
                        <span style={{ color: 'red' }}>{errors.assetId.message}</span>
                    )}
                </div>

                <div style={{ marginBottom: '1rem' }}>
                    <label>Quantidade</label>
                    <input
                        type="number"
                        step="1"
                        placeholder="Digite a quantidade"
                        {...register('quantity')}
                        style={{ width: '100%', padding: '0.5rem' }}
                    />
                    {errors.quantity && (
                        <span style={{ color: 'red' }}>{errors.quantity.message}</span>
                    )}
                </div>

                {selectedAsset && quantityNum > 0 && (
                    <div style={{ marginBottom: '1rem', padding: '1rem', backgroundColor: '#e9ecef', borderRadius: '4px' }}>
                        <p><strong>Resumo da Compra:</strong></p>
                        <p>Ativo: {selectedAsset.name}</p>
                        <p>Preço unitário: R$ {(selectedAsset.currentPrice || 0).toFixed(2)}</p>
                        <p>Quantidade: {quantityNum}</p>
                        <p><strong>Total: R$ {totalValue.toFixed(2)}</strong></p>

                        {accounts.length > 0 && (
                            <p style={{
                                color: totalValue > accounts[0].balance ? 'red' : 'green',
                                fontWeight: 'bold'
                            }}>
                                Saldo após compra: R$ {(accounts[0].balance - totalValue).toFixed(2)}
                            </p>
                        )}
                    </div>
                )}

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
                    Confirmar Compra
                </button>
            </form>
        </div>
    )
} 