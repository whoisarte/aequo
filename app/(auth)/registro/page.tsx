'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { createClient } from '@/lib/supabase/client'
import { useToast } from '@/lib/toast/index'
import { registerSchema, type RegisterFormData } from '@/lib/forms/schemas'
import FormProvider from '@/components/forms/FormProvider'
import FormField from '@/components/forms/FormField'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'

export default function RegistroPage() {
  const toast = useToast()
  const methods = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: { nombre: '', email: '', password: '', confirmPassword: '' },
  })
  const { formState: { isSubmitting }, reset } = methods

  async function handleRegistro(formData: RegisterFormData) {
    try {
      const supabase = createClient()
      const { error } = await supabase.auth.signUp({ 
        email: formData.email, 
        password: formData.password,
        options: {
          data: { nombre: formData.nombre }
        }
      })

      if (error) {
        toast.error('Error al crear cuenta: ' + error.message)
      } else {
        reset()
        toast.success('Cuenta creada. Revisa tu correo para confirmar')
      }
    } catch (err) {
      console.error('Registration error:', err)
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
      <FormProvider methods={methods} onSubmit={handleRegistro}>
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
              Crea tu cuenta
            </p>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <FormField name="nombre" label="Nombre completo">
              {(field) => (
                <Input
                  {...field}
                  type="text"
                  placeholder="Tu nombre"
                />
              )}
            </FormField>
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
            <FormField name="confirmPassword" label="Confirmar contraseña">
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
            {isSubmitting ? 'Creando cuenta...' : 'Crear cuenta'}
          </Button>

          <p
            style={{
              fontSize: '13px',
              color: 'var(--text-secondary)',
              textAlign: 'center',
            }}
          >
            ¿Ya tienes cuenta?{' '}
            <a href="/login" style={{ color: 'var(--text-primary)', fontWeight: '500' }}>
              Inicia sesión
            </a>
          </p>
        </div>
      </FormProvider>
    </div>
  )
}
