type InputProps = {
  label: string
  name: string
  type?: string
  value: string
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  placeholder?: string
  required?: boolean
  fullWidth?: boolean // Add this line
}

export default function Input({
  label,
  name,
  type = 'text',
  value,
  onChange,
  placeholder,
  required,
  fullWidth, // Destructure the new prop
}: InputProps) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', width: fullWidth ? '100%' : 'auto' }}>
      <label
        htmlFor={name}
        style={{ fontSize: '13px', fontWeight: '500', color: 'var(--text-secondary)' }}
      >
        {label}
      </label>
      <input
        id={name}
        name={name}
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        style={{
          padding: '8px 12px',
          borderRadius: 'var(--radius)',
          border: '1px solid var(--border)',
          background: 'var(--bg-input)',
          color: 'var(--text-primary)',
          outline: 'none',
          width: '100%',
        }}
      />
    </div>
  )
}
