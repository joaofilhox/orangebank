import { z } from 'zod'

export const registerSchema = z.object({
    fullName: z.string().min(1, 'Nome obrigatório'),
    email: z.string().email('Email inválido'),
    cpf: z.string().min(11, 'CPF deve ter no mínimo 11 dígitos'),
    birthDate: z.string().min(1, 'Data de nascimento obrigatória'),
    password: z.string().min(6, 'Senha deve ter no mínimo 6 caracteres')
})

export type RegisterSchema = z.infer<typeof registerSchema> 