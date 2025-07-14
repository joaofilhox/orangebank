import { useEffect, useState } from 'react'
import { getAssets, type Asset } from '../../api/account'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import { getToken } from '../../utils/token'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api'

interface AssetWithEdit extends Asset {
    isEditing: boolean
    newPrice: number
}

export default function AssetsManagementPage() {
    const [assets, setAssets] = useState<AssetWithEdit[]>([])
    const [loading, setLoading] = useState(true)
    const [updating, setUpdating] = useState<string | null>(null)
    const navigate = useNavigate()

    useEffect(() => {
        fetchAssets()
    }, [])

    const fetchAssets = async () => {
        try {
            setLoading(true)
            const assetsData = await getAssets()
            const assetsWithEdit = assetsData.map(asset => ({
                ...asset,
                isEditing: false,
                newPrice: asset.currentPrice
            }))
            setAssets(assetsWithEdit)
        } catch (error) {
            console.error('Erro ao carregar assets:', error)
        } finally {
            setLoading(false)
        }
    }

    const handleEdit = (assetId: string) => {
        setAssets(prev => prev.map(asset =>
            asset.id === assetId
                ? { ...asset, isEditing: true, newPrice: asset.currentPrice }
                : asset
        ))
    }

    const handleCancelEdit = (assetId: string) => {
        setAssets(prev => prev.map(asset =>
            asset.id === assetId
                ? { ...asset, isEditing: false, newPrice: asset.currentPrice }
                : asset
        ))
    }

    const handlePriceChange = (assetId: string, newPrice: number) => {
        setAssets(prev => prev.map(asset =>
            asset.id === assetId
                ? { ...asset, newPrice }
                : asset
        ))
    }

    const handleSave = async (asset: AssetWithEdit) => {
        if (asset.newPrice <= 0) {
            alert('O preço deve ser maior que zero')
            return
        }

        try {
            setUpdating(asset.id)

            const token = getToken()
            await axios.put(`${API_BASE_URL}/Assets/${asset.id}`, {
                name: asset.name,
                type: asset.type,
                currentPrice: asset.newPrice
            }, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            })

            // Atualiza o asset localmente
            setAssets(prev => prev.map(a =>
                a.id === asset.id
                    ? {
                        ...a,
                        currentPrice: asset.newPrice,
                        isEditing: false,
                        newPrice: asset.newPrice
                    }
                    : a
            ))

            alert('Preço atualizado com sucesso!')
        } catch (error) {
            console.error('Erro ao atualizar preço:', error)
            alert('Erro ao atualizar preço. Tente novamente.')
        } finally {
            setUpdating(null)
        }
    }

    const getAssetTypeName = (type: number) => {
        switch (type) {
            case 0: return 'Ação'
            case 1: return 'Fundo Imobiliário'
            case 2: return 'Tesouro Direto'
            default: return 'Desconhecido'
        }
    }

    if (loading) {
        return (
            <div className="page-container">
                <div className="container">
                    <div className="loading">
                        Carregando ativos...
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="page-container">
            <div className="container">
                <div className="page-header fade-in">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
                        <button
                            onClick={() => navigate('/dashboard')}
                            className="btn btn-secondary"
                            style={{ fontSize: '1.2rem', padding: '0.5rem 1rem' }}
                        >
                            ← Voltar
                        </button>
                        <h1 className="page-title text-primary">💰 Gerenciar Preços dos Ativos</h1>
                    </div>
                    <p className="page-subtitle">
                        Atualize os preços dos ativos e veja como os impostos são calculados nas transações
                    </p>
                </div>

                <div className="card fade-in">
                    <div className="card-header">
                        <h2 className="card-title">📊 Lista de Ativos</h2>
                        <p className="text-muted">
                            Clique em "Editar" para modificar o preço de um ativo.
                            As mudanças afetarão automaticamente o cálculo de impostos nas transações.
                        </p>
                    </div>

                    {assets.length === 0 ? (
                        <div className="text-center" style={{ padding: '2rem' }}>
                            <p className="text-muted">Nenhum ativo encontrado.</p>
                        </div>
                    ) : (
                        <div style={{ overflowX: 'auto' }}>
                            <table style={{
                                width: '100%',
                                borderCollapse: 'collapse',
                                marginTop: '1rem'
                            }}>
                                <thead>
                                    <tr style={{
                                        backgroundColor: 'var(--color-background-secondary)',
                                        borderBottom: '2px solid var(--color-border)'
                                    }}>
                                        <th style={{ padding: '1rem', textAlign: 'left', fontWeight: 'bold' }}>Nome</th>
                                        <th style={{ padding: '1rem', textAlign: 'left', fontWeight: 'bold' }}>Tipo</th>
                                        <th style={{ padding: '1rem', textAlign: 'right', fontWeight: 'bold' }}>Preço Atual</th>
                                        <th style={{ padding: '1rem', textAlign: 'center', fontWeight: 'bold' }}>Ações</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {assets.map((asset) => (
                                        <tr key={asset.id} style={{
                                            borderBottom: '1px solid var(--color-border)',
                                            transition: 'background-color 0.2s'
                                        }}>
                                            <td style={{ padding: '1rem', fontWeight: '500' }}>
                                                {asset.name}
                                            </td>
                                            <td style={{ padding: '1rem' }}>
                                                <span style={{
                                                    padding: '0.25rem 0.75rem',
                                                    borderRadius: '1rem',
                                                    fontSize: '0.875rem',
                                                    backgroundColor: 'var(--color-primary-light)',
                                                    color: 'var(--color-primary)'
                                                }}>
                                                    {getAssetTypeName(asset.type)}
                                                </span>
                                            </td>
                                            <td style={{ padding: '1rem', textAlign: 'right' }}>
                                                {asset.isEditing ? (
                                                    <input
                                                        type="number"
                                                        step="0.01"
                                                        min="0"
                                                        value={asset.newPrice}
                                                        onChange={(e) => handlePriceChange(asset.id, parseFloat(e.target.value) || 0)}
                                                        style={{
                                                            width: '120px',
                                                            padding: '0.5rem',
                                                            border: '1px solid var(--color-border)',
                                                            borderRadius: '4px',
                                                            fontSize: '1rem'
                                                        }}
                                                    />
                                                ) : (
                                                    <span style={{ fontWeight: 'bold', color: 'var(--color-primary)' }}>
                                                        R$ {asset.currentPrice.toFixed(2)}
                                                    </span>
                                                )}
                                            </td>
                                            <td style={{ padding: '1rem', textAlign: 'center' }}>
                                                {asset.isEditing ? (
                                                    <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center', flexWrap: 'wrap' }}>
                                                        <button
                                                            onClick={() => handleSave(asset)}
                                                            disabled={updating === asset.id}
                                                            className="btn btn-success"
                                                            style={{ fontSize: '0.875rem', padding: '0.5rem 1rem' }}
                                                        >
                                                            {updating === asset.id ? 'Salvando...' : '💾 Salvar'}
                                                        </button>
                                                        <button
                                                            onClick={() => handleCancelEdit(asset.id)}
                                                            disabled={updating === asset.id}
                                                            className="btn btn-secondary"
                                                            style={{ fontSize: '0.875rem', padding: '0.5rem 1rem' }}
                                                        >
                                                            ❌ Cancelar
                                                        </button>
                                                    </div>
                                                ) : (
                                                    <button
                                                        onClick={() => handleEdit(asset.id)}
                                                        className="btn btn-primary"
                                                        style={{ fontSize: '0.875rem', padding: '0.5rem 1rem' }}
                                                    >
                                                        ✏️ Editar
                                                    </button>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>

                <div className="card fade-in">
                    <div className="card-header">
                        <h2 className="card-title">📋 Regras de Negócio - Operações de Ativos</h2>
                    </div>
                    <div style={{ padding: '1rem' }}>

                        {/* Ativos Disponíveis */}
                        <div style={{ marginBottom: '2rem' }}>
                            <h3 style={{
                                color: 'var(--color-primary)',
                                fontSize: '1.2rem',
                                marginBottom: '1rem',
                                borderBottom: '2px solid var(--color-primary)',
                                paddingBottom: '0.5rem'
                            }}>
                                🎯 Ativos Disponíveis para Negociação
                            </h3>
                            <div style={{
                                display: 'grid',
                                gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
                                gap: '1rem',
                                marginBottom: '1rem'
                            }}>
                                <div style={{
                                    padding: '1rem',
                                    backgroundColor: 'var(--color-background-secondary)',
                                    borderRadius: '8px',
                                    border: '2px solid var(--color-primary-light)'
                                }}>
                                    <h4 style={{ color: 'var(--color-primary)', marginBottom: '0.5rem' }}>📈 Ações</h4>
                                    <p style={{ fontSize: '0.9rem', margin: 0 }}>
                                        Empresas fictícias com valores que flutuam dinamicamente
                                    </p>
                                </div>
                                <div style={{
                                    padding: '1rem',
                                    backgroundColor: 'var(--color-background-secondary)',
                                    borderRadius: '8px',
                                    border: '2px solid var(--color-success)'
                                }}>
                                    <h4 style={{ color: 'var(--color-success)', marginBottom: '0.5rem' }}>🏦 CDB e Tesouro Direto</h4>
                                    <p style={{ fontSize: '0.9rem', margin: 0 }}>
                                        Com rentabilidade fixa (pré ou pós-fixada)
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Regras de Compra */}
                        <div style={{ marginBottom: '2rem' }}>
                            <h3 style={{
                                color: 'var(--color-success)',
                                fontSize: '1.2rem',
                                marginBottom: '1rem',
                                borderBottom: '2px solid var(--color-success)',
                                paddingBottom: '0.5rem'
                            }}>
                                💰 Regras para Compra de Ativos
                            </h3>
                            <div style={{
                                padding: '1rem',
                                backgroundColor: 'var(--color-success-light)',
                                borderRadius: '8px',
                                border: '1px solid var(--color-success)'
                            }}>
                                <ul style={{ margin: 0, paddingLeft: '1.5rem', lineHeight: '1.6' }}>
                                    <li><strong>Saldo necessário:</strong> O cliente deve ter saldo suficiente na Conta Investimento</li>
                                    <li><strong>Taxa de corretagem:</strong> Percentual fixo de <strong>1%</strong> para ações</li>
                                </ul>
                            </div>
                        </div>

                        {/* Regras de Venda e Tributação */}
                        <div style={{ marginBottom: '2rem' }}>
                            <h3 style={{
                                color: 'var(--color-warning)',
                                fontSize: '1.2rem',
                                marginBottom: '1rem',
                                borderBottom: '2px solid var(--color-warning)',
                                paddingBottom: '0.5rem'
                            }}>
                                💸 Regras para Venda de Ativos e Tributação
                            </h3>

                            <div style={{ marginBottom: '1.5rem' }}>
                                <h4 style={{ color: 'var(--color-text)', marginBottom: '0.5rem' }}>📊 Processo de Venda:</h4>
                                <ul style={{ marginLeft: '1.5rem', lineHeight: '1.6', marginBottom: '1rem' }}>
                                    <li>O valor da venda é sempre creditado na <strong>Conta Investimento</strong></li>
                                    <li>O sistema calcula e retém automaticamente o imposto devido</li>
                                    <li>O valor líquido (já descontado o imposto) fica disponível para novas operações</li>
                                </ul>
                            </div>

                            <div style={{ marginBottom: '1.5rem' }}>
                                <h4 style={{ color: 'var(--color-text)', marginBottom: '0.5rem' }}>🏛️ Tributação por Tipo de Ativo:</h4>
                                <div style={{
                                    display: 'grid',
                                    gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                                    gap: '1rem'
                                }}>
                                    <div style={{
                                        padding: '1rem',
                                        backgroundColor: 'var(--color-warning-light)',
                                        borderRadius: '8px',
                                        border: '2px solid var(--color-warning)'
                                    }}>
                                        <h5 style={{ color: 'var(--color-warning)', marginBottom: '0.5rem' }}>📈 Renda Variável (Ações)</h5>
                                        <p style={{ fontSize: '0.9rem', margin: 0, fontWeight: 'bold' }}>
                                            Imposto de Renda: <span style={{ color: 'var(--color-warning)', fontSize: '1.1rem' }}>15%</span>
                                        </p>
                                        <p style={{ fontSize: '0.8rem', margin: '0.5rem 0 0 0', color: 'var(--color-text-secondary)' }}>
                                            Incide sobre o rendimento obtido na operação (diferença entre valor de venda e valor investido)
                                        </p>
                                    </div>
                                    <div style={{
                                        padding: '1rem',
                                        backgroundColor: 'var(--color-info-light)',
                                        borderRadius: '8px',
                                        border: '2px solid var(--color-info)'
                                    }}>
                                        <h5 style={{ color: 'var(--color-info)', marginBottom: '0.5rem' }}>🏦 Renda Fixa (CDB e Tesouro Direto)</h5>
                                        <p style={{ fontSize: '0.9rem', margin: 0, fontWeight: 'bold' }}>
                                            Imposto de Renda: <span style={{ color: 'var(--color-info)', fontSize: '1.1rem' }}>22%</span>
                                        </p>
                                        <p style={{ fontSize: '0.8rem', margin: '0.5rem 0 0 0', color: 'var(--color-text-secondary)' }}>
                                            Incide sobre o rendimento obtido na operação (diferença entre valor de venda/resgate e valor investido)
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Dica Importante */}
                        <div style={{
                            padding: '1rem',
                            backgroundColor: 'var(--color-primary-light)',
                            borderRadius: '8px',
                            border: '2px solid var(--color-primary)'
                        }}>
                            <h4 style={{ color: 'var(--color-primary)', marginBottom: '0.5rem' }}>💡 Dica Importante</h4>
                            <p style={{ margin: 0, fontSize: '0.95rem', lineHeight: '1.5' }}>
                                <strong>Simulação de Cenários:</strong> Ao alterar os preços dos ativos nesta página, você pode simular
                                diferentes cenários de mercado e ver como isso afeta automaticamente o cálculo de impostos nas
                                transações dos usuários. Isso permite testar estratégias e entender o impacto das variações de preço
                                na tributação.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
} 