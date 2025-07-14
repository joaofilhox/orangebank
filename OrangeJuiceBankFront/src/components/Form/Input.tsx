import React from 'react'

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label?: string
    error?: any
}

export default function Input({ label, error, ...props }: InputProps) {
    return (
        <div className="form-group">
            {label && (
                <label className="form-label">
                    {label}
                </label>
            )}
            <input
                className={`form-input ${error ? 'error' : ''}`}
                {...props}
            />
            {error && (
                <div className="form-error">
                    {error.message}
                </div>
            )}
        </div>
    )
} 