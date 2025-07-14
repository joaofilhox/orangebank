import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { loginSchema } from './schema'
import { login } from '../../api/auth'
import { saveToken } from '../../utils/token'
import Input from '../../components/Form/Input'
import { useNavigate, useLocation } from 'react-router-dom'
import type { LoginSchema } from './schema'
import { hasAccounts, createAccount } from '../../api/account'

export default function LoginPage() {
    const navigate = useNavigate()
    const location = useLocation()
    const [apiError, setApiError] = useState('')
    const [successMessage, setSuccessMessage] = useState('')
    const [isLoading, setIsLoading] = useState(false)

    // Verificar se há mensagem de sucesso do registro
    useEffect(() => {
        if (location.state?.message) {
            setSuccessMessage(location.state.message)
            // Limpar o state para não mostrar a mensagem novamente
            navigate(location.pathname, { replace: true })
        }
    }, [location.state, navigate, location.pathname])

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<LoginSchema>({
        resolver: zodResolver(loginSchema),
    })

    const onSubmit = async (data: LoginSchema) => {
        setApiError('')
        setIsLoading(true)

        try {
            const response = await login(data.email, data.password)
            saveToken(response.token)

            // Verificar se o usuário já tem contas
            const userHasAccounts = await hasAccounts()

            if (!userHasAccounts) {
                // Criar contas automaticamente para novos usuários
                try {
                    await createAccount(1) // Conta Corrente

                    // Pequeno delay entre as criações
                    await new Promise(resolve => setTimeout(resolve, 500))

                    await createAccount(2) // Conta Investimento
                } catch (accountError: any) {
                    console.error('Erro ao criar contas:', accountError)
                    // Não impedir o login mesmo se falhar ao criar contas
                }
            }

            navigate('/dashboard')
        } catch (err) {
            console.error('Erro no login:', err)
            setApiError('Login inválido. Verifique seus dados.')
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className="page-container">
            <div className="container">
                <div className="page-header fade-in">
                    <h1 className="page-title text-primary">🍊 Orange Juice Bank</h1>
                    <p className="page-subtitle">Faça login para acessar sua conta</p>
                </div>

                <div className="card fade-in" style={{ maxWidth: '400px', margin: '0 auto' }}>
                    <form onSubmit={handleSubmit(onSubmit)}>
                        <Input
                            label="Email"
                            type="email"
                            placeholder="Digite seu email"
                            {...register('email')}
                            error={errors.email}
                        />

                        <Input
                            label="Senha"
                            type="password"
                            placeholder="Digite sua senha"
                            {...register('password')}
                            error={errors.password}
                        />

                        {successMessage && (
                            <div className="form-success text-center mb-4">
                                {successMessage}
                            </div>
                        )}

                        {apiError && (
                            <div className="form-error text-center mb-4">
                                {apiError}
                            </div>
                        )}

                        <button
                            type="submit"
                            className="btn btn-primary btn-full"
                            disabled={isLoading}
                        >
                            {isLoading ? 'Entrando...' : 'Entrar'}
                        </button>
                    </form>

                    <div className="text-center mt-6">
                        <p className="text-muted">
                            Não tem conta?{' '}
                            <a href="/register" className="text-primary">
                                Criar conta
                            </a>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    )
} 