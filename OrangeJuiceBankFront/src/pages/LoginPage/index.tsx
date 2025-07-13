import React, { useState, useEffect } from 'react'
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
        }
    }

    return (
        <div style={{ maxWidth: '400px', margin: '0 auto', padding: '2rem' }}>
            <h1>Login</h1>
            <form onSubmit={handleSubmit(onSubmit)}>
                <Input
                    label="Email"
                    {...register('email')}
                    error={errors.email}
                />
                <Input
                    label="Senha"
                    type="password"
                    {...register('password')}
                    error={errors.password}
                />
                {successMessage && (
                    <div style={{ color: 'green', marginBottom: '1rem', textAlign: 'center' }}>{successMessage}</div>
                )}
                {apiError && (
                    <div style={{ color: 'red', marginBottom: '1rem' }}>{apiError}</div>
                )}
                <button
                    type="submit"
                    style={{
                        width: '100%',
                        padding: '.75rem',
                        background: '#007bff',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer',
                    }}
                >
                    Entrar
                </button>
            </form>
            <p style={{ marginTop: '1rem', textAlign: 'center' }}>
                Não tem conta? <a href="/register">Criar conta</a>
            </p>
        </div>
    )
} 