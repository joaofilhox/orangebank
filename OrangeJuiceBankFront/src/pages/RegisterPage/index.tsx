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
    const [isLoading, setIsLoading] = useState(false)

    const {
        register,
        handleSubmit,
        formState: { errors }
    } = useForm<RegisterSchema>({
        resolver: zodResolver(registerSchema)
    })

    const onSubmit = async (data: RegisterSchema) => {
        setApiError('')
        setIsLoading(true)

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
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className="page-container">
            <div className="container">
                <div className="page-header fade-in">
                    <h1 className="page-title text-primary">🍊 Orange Juice Bank</h1>
                    <p className="page-subtitle">Crie sua conta gratuitamente</p>
                </div>

                <div className="card fade-in" style={{ maxWidth: '500px', margin: '0 auto' }}>
                    <form onSubmit={handleSubmit(onSubmit)}>
                        <Input
                            label="Nome completo"
                            placeholder="Digite seu nome completo"
                            {...register('fullName')}
                            error={errors.fullName}
                        />

                        <Input
                            label="Email"
                            type="email"
                            placeholder="Digite seu email"
                            {...register('email')}
                            error={errors.email}
                        />

                        <Input
                            label="CPF"
                            placeholder="000.000.000-00"
                            {...register('cpf')}
                            error={errors.cpf}
                        />

                        <Input
                            label="Data de nascimento"
                            type="date"
                            {...register('birthDate')}
                            error={errors.birthDate}
                        />

                        <Input
                            label="Senha"
                            type="password"
                            placeholder="Digite sua senha"
                            {...register('password')}
                            error={errors.password}
                        />

                        {apiError && (
                            <div className="form-error text-center mb-4">
                                {apiError}
                            </div>
                        )}

                        <button
                            type="submit"
                            className="btn btn-success btn-full"
                            disabled={isLoading}
                        >
                            {isLoading ? 'Criando conta...' : 'Criar Conta'}
                        </button>
                    </form>

                    <div className="text-center mt-6">
                        <p className="text-muted">
                            Já tem conta?{' '}
                            <a href="/" className="text-primary">
                                Fazer login
                            </a>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    )
} 