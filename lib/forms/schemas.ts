import { z } from 'zod'

export const loginSchema = z.object({
  email: z.string().email('Correo electrónico inválido'),
  password: z.string().min(6, 'Contraseña debe tener al menos 6 caracteres'),
})

export type LoginFormData = z.infer<typeof loginSchema>

export const registerSchema = z.object({
  nombre: z.string().min(2, 'Nombre debe tener al menos 2 caracteres'),
  email: z.string().email('Correo electrónico inválido'),
  password: z.string().min(6, 'Contraseña debe tener al menos 6 caracteres'),
  confirmPassword: z.string().min(6, 'Debe confirmar la contraseña'),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Las contraseñas no coinciden',
  path: ['confirmPassword'],
})

export type RegisterFormData = z.infer<typeof registerSchema>

export const checkoutSchema = z.object({
  planId: z.string().min(1, 'El ID del plan es requerido'),
  mode: z.enum(['subscription', 'payment']).optional().default('subscription'),
})

export type CheckoutFormData = z.infer<typeof checkoutSchema>

export const perfilSchema = z.object({
  nombreEmpresa: z.string().min(1, 'El nombre de la empresa es requerido'),
  colorPrimario: z.string().regex(/^#[0-9A-F]{6}$/i, 'Color inválido'),
  porcentajeConciliacion: z.number().min(0).max(100, 'Porcentaje debe estar entre 0 y 100'),
  zonaSalarial: z.enum(['general', 'frontera_norte']).default('general'), // Add this line
})

export type PerfilFormData = z.infer<typeof perfilSchema>
