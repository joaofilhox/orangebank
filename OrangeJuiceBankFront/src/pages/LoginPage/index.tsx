import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { loginSchema } from './schema'
import { login } from '../../api/auth'
import { saveToken } from '../../utils/token'
import Input from '../../components/Form/Input'
import { useNavigate } from 'react-router-dom'
import { useState } from 'react'
import type { LoginSchema } from './schema'

export default function LoginPage() {
    const navigate = useNavigate()
    const [apiError, setApiError] = useState('')
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
            navigate('/dashboard')
        } catch (err) {
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
        </div>
    )
} 