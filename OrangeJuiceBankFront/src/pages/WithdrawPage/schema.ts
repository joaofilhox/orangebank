import { z } from 'zod'

export const withdrawSchema = z.object({
    amount: z.string().min(1, 'Digite um valor')
})

export type WithdrawSchema = {
    amount: string
} 