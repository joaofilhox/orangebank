import { z } from 'zod'

export const buyAssetSchema = z.object({
    assetId: z.string().min(1, 'Selecione o ativo'),
    quantity: z.string().min(1, 'Digite a quantidade')
})

export type BuyAssetSchema = {
    assetId: string
    quantity: string
} 