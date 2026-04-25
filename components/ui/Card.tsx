import { ReactNode } from 'react'

interface CardProps {
  children: ReactNode
  variant?: 'outline' | 'subtle'
  padding?: 'sm' | 'md' | 'lg'
  className?: string
}

const paddingSizes = {
  sm: '12px',
  md: '16px',
  lg: '24px',
}

const variantStyles = {
  outline: {
    border: '1px solid var(--border)',
    backgroundColor: 'var(--bg-card)',
  },
  subtle: {
    border: 'none',
    backgroundColor: 'var(--bg-surface)',
  },
}

export default function Card({
  children,
  variant = 'outline',
  padding = 'md',
  className,
}: CardProps) {
  return (
    <div
      style={{
        border: variantStyles[variant].border,
        backgroundColor: variantStyles[variant].backgroundColor,
        borderRadius: 'var(--radius)',
        padding: paddingSizes[padding],
        ...((className || '').includes('') && {}), // Placeholder for className if needed
      }}
    >
      {children}
    </div>
  )
}
