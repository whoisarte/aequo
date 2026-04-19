'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { createClient } from '@/lib/supabase/client'
import { useToast } from '@/lib/toast/index'
import { loginSchema, type LoginFormData } from '@/lib/forms/schemas'
import FormProvider from '@/components/forms/FormProvider'
import FormField from '@/components/forms/FormField'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'

export default function LoginPage() {
  const router = useRouter()
  const toast = useToast()
  const methods = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  })
  const { formState: { isSubmitting } } = methods

  useEffect(() => {
    if (window.location.hash.includes('access_token')) {
      router.push('/confirm' + window.location.hash)
    }
  }, [router])

  async function handleLogin(formData: LoginFormData) {
    try {
      const supabase = createClient()
      const { data, error: loginError } = await supabase.auth.signInWithPassword({
        email: formData.email,
        password: formData.password,
      })

      if (loginError) {
        toast.error('Error al iniciar sesión: ' + loginError.message)
      } else if (data.session) {
        toast.success('¡Bienvenido! Iniciando sesión...')
        router.refresh()
        router.push('/calculadora')
      }
    } catch (err) {
      console.error('Login error:', err)
      toast.error('Error inesperado. Por favor intenta nuevamente')
    }
  }

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'var(--bg-surface)',
      }}
    >
      <FormProvider methods={methods} onSubmit={handleLogin}>
        <div
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
            <h1
              style={{ fontSize: '20px', fontWeight: '600', marginBottom: '4px' }}
            >
              Aequo
            </h1>
            <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>
              Inicia sesión para continuar
            </p>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <FormField name="email" label="Correo electrónico">
              {(field) => (
                <Input
                  {...field}
                  type="email"
                  placeholder="tu@correo.com"
                />
              )}
            </FormField>
            <FormField name="password" label="Contraseña">
              {(field) => (
                <Input
                  {...field}
                  type="password"
                  placeholder="••••••••"
                />
              )}
            </FormField>
          </div>

          <Button type="submit" disabled={isSubmitting} fullWidth>
            {isSubmitting ? 'Entrando...' : 'Iniciar sesión'}
          </Button>

          <p
            style={{
              fontSize: '13px',
              color: 'var(--text-secondary)',
              textAlign: 'center',
            }}
          >
            ¿No tienes cuenta?{' '}
            <a href="/registro" style={{ color: 'var(--text-primary)', fontWeight: '500' }}>
              Regístrate
            </a>
          </p>
        </div>
      </FormProvider>
    </div>
  )
}
