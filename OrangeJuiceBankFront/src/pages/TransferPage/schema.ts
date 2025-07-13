import { z } from 'zod'

export const transferSchema = z.object({
    transferType: z.enum(['self', 'external']),
    sourceAccountId: z.string().min(1, 'Selecione a conta de origem'),
    destinationAccountId: z.string().optional(),
    amount: z.string().min(1, 'Digite um valor')
}).refine((data) => {
    if (data.transferType === 'external' && (!data.destinationAccountId || data.destinationAccountId.trim() === '')) {
        return false
    }
    return true
}, {
    message: 'Informe o número da conta de destino',
    path: ['destinationAccountId']
})

export type TransferSchema = {
    transferType: 'self' | 'external'
    sourceAccountId: string
    destinationAccountId?: string
    amount: string
} 