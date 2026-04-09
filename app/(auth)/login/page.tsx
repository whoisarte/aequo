'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (window.location.hash.includes('access_token')) {
      router.push('/confirm' + window.location.hash)
    }
  }, [router])

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    if (loading) return
    
    setLoading(true)
    setError('')
    
    try {
      const supabase = createClient()
      const { data, error: loginError } = await supabase.auth.signInWithPassword({ 
        email, 
        password 
      })
      
      if (loginError) {
        setError(loginError.message)
        setLoading(false)
      } else if (data.session) {
        // Forzamos un refresh para que el middleware vea las nuevas cookies
        router.refresh()
        router.push('/calculadora')
      } else {
        setLoading(false)
      }
    } catch (err) {
      console.error('Login error:', err)
      setError('Error inesperado al intentar entrar.')
      setLoading(false)
    }
  }

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'var(--bg-surface)',
    }}>
      <form 
        onSubmit={handleLogin}
        style={{
          background: 'var(--bg-primary)',
          border: '1px solid var(--border)',
          borderRadius: 'var(--radius)',
          padding: '40px',
          width: '100%',
          maxWidth: '400px',
          display: 'flex',
          flexDirection: 'column',
          gap: '24px',
        }}
      >
        <div>
          <h1 style={{ fontSize: '20px', fontWeight: '600', marginBottom: '4px' }}>Aequo</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>Inicia sesión para continuar</p>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <Input
            label="Correo electrónico"
            name="email"
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            placeholder="tu@correo.com"
            required
          />
          <Input
            label="Contraseña"
            name="password"
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            placeholder="••••••••"
            required
          />
        </div>

        {error && (
          <p style={{ color: '#dc2626', fontSize: '13px' }}>{error}</p>
        )}

        <Button type="submit" disabled={loading} fullWidth>
          {loading ? 'Entrando...' : 'Iniciar sesión'}
        </Button>

        <p style={{ fontSize: '13px', color: 'var(--text-secondary)', textAlign: 'center' }}>
          ¿No tienes cuenta?{' '}
          <a href="/registro" style={{ color: 'var(--text-primary)', fontWeight: '500' }}>
            Regístrate
          </a>
        </p>
      </form>
    </div>
  )
}
