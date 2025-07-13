import type { FieldError } from 'react-hook-form'

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label: string
    error?: FieldError
}

export default function Input({ label, error, ...rest }: InputProps) {
    return (
        <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', marginBottom: '.25rem' }}>{label}</label>
            <input
                {...rest}
                style={{
                    width: '100%',
                    padding: '.5rem',
                    border: error ? '1px solid red' : '1px solid #ccc',
                    borderRadius: '4px',
                }}
            />
            {error && (
                <span style={{ color: 'red', fontSize: '.875rem' }}>
                    {error.message}
                </span>
            )}
        </div>
    )
} 