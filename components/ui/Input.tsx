import React, { InputHTMLAttributes, forwardRef } from 'react'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string; // Make label optional for cases like the chat input
  name: string;
  fullWidth?: boolean;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, name, type = 'text', fullWidth, ...props }, ref) => {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', width: fullWidth ? '100%' : 'auto' }}>
        {label && ( // Conditionally render label
          <label
            htmlFor={name}
            style={{ fontSize: '13px', fontWeight: '500', color: 'var(--text-secondary)' }}
          >
            {label}
          </label>
        )}
        <input
          id={name}
          name={name}
          type={type}
          ref={ref} // Pass the forwarded ref here
          style={{
            padding: '8px 12px',
            borderRadius: 'var(--radius)',
            border: '1px solid var(--border)',
            background: 'var(--bg-input)',
            color: 'var(--text-primary)',
            outline: 'none',
            width: '100%',
          }}
          {...props} // Pass remaining props (value, onChange, placeholder, required etc.)
        />
      </div>
    )
  }
)

Input.displayName = 'Input'; // Add display name for better debugging

export default Input;
