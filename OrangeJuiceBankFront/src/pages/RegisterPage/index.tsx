import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { registerSchema } from './schema'
import type { RegisterSchema } from './schema'
import Input from '../../components/Form/Input'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { registerUser } from '../../api/auth'

export default function RegisterPage() {
    const navigate = useNavigate()
    const [apiError, setApiError] = useState('')

    const {
        register,
        handleSubmit,
        formState: { errors }
    } = useForm<RegisterSchema>({
        resolver: zodResolver(registerSchema)
    })

    const onSubmit = async (data: RegisterSchema) => {
        setApiError('')
        try {
            // Registrar usuário
            await registerUser({
                fullName: data.fullName,
                email: data.email,
                cpf: data.cpf,
                birthDate: data.birthDate,
                password: data.password
            })

            // Redirecionar para login com mensagem de sucesso
            navigate('/', { state: { message: 'Conta criada com sucesso! Faça login para continuar.' } })
        } catch (err) {
            console.error(err)
            setApiError('Erro ao criar usuário. Verifique os dados e tente novamente.')
        }
    }

    return (
        <div style={{ maxWidth: '500px', margin: '0 auto', padding: '2rem' }}>
            <h1>Criar Conta</h1>
            <form onSubmit={handleSubmit(onSubmit)}>
                <Input label="Nome completo" {...register('fullName')} error={errors.fullName} />
                <Input label="Email" {...register('email')} error={errors.email} />
                <Input label="CPF" {...register('cpf')} error={errors.cpf} />
                <Input label="Data de nascimento" type="date" {...register('birthDate')} error={errors.birthDate} />
                <Input label="Senha" type="password" {...register('password')} error={errors.password} />

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
                    Criar Conta
                </button>
            </form>
        </div>
    )
} 