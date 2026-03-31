'use client'

type ButtonProps = {
  children: React.ReactNode
  onClick?: () => void
  type?: 'button' | 'submit' | 'reset'
  variant?: 'primary' | 'secondary'
  disabled?: boolean
  fullWidth?: boolean
}

export default function Button({
  children,
  onClick,
  type = 'button',
  variant = 'primary',
  disabled = false,
  fullWidth = false,
}: ButtonProps) {
  const base: React.CSSProperties = {
    padding: '8px 16px',
    borderRadius: 'var(--radius)',
    fontSize: '14px',
    fontWeight: '500',
    cursor: disabled ? 'not-allowed' : 'pointer',
    opacity: disabled ? 0.5 : 1,
    transition: 'all 0.15s',
    width: fullWidth ? '100%' : 'auto',
    border: '1px solid transparent',
  }

  const styles: Record<string, React.CSSProperties> = {
    primary: {
      ...base,
      background: 'var(--accent)',
      color: '#ffffff',
      borderColor: 'var(--accent)',
    },
    secondary: {
      ...base,
      background: 'transparent',
      color: 'var(--text-primary)',
      borderColor: 'var(--border)',
    },
  }

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      style={styles[variant]}
    >
      {children}
    </button>
  )
}