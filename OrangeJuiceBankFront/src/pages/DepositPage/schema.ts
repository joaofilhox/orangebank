import { z } from 'zod'

export const depositSchema = z.object({
    amount: z.number().positive('O valor deve ser maior que zero')
})

export type DepositSchema = z.infer<typeof depositSchema> 