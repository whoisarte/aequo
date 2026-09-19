import { z } from 'zod'

const appMode = process.env.NEXT_PUBLIC_APP_MODE || 'development'

const baseEnvSchema = z.object({
  NEXT_PUBLIC_APP_MODE: z.enum(['production', 'development', 'local']).default('development'),
})

const mockEnvSchema = baseEnvSchema.extend({
  NEXT_PUBLIC_SUPABASE_URL: z.string().url().default('http://localhost:54321'),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1).default('mock_anon_key'),
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1).default('mock_service_role_key'),
  STRIPE_SECRET_KEY: z.string().min(1).default('sk_test_mock'),
  STRIPE_WEBHOOK_SECRET: z.string().min(1).default('whsec_mock'),
  NEXT_PUBLIC_STRIPE_PUBLIC_KEY: z.string().min(1).default('pk_test_mock'),
  GEMINI_API_KEY: z.string().optional().default('mock_gemini_key'),
})

const realEnvSchema = baseEnvSchema.extend({
  NEXT_PUBLIC_SUPABASE_URL: z.string().url(),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1),
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1),
  STRIPE_SECRET_KEY: z.string().min(1),
  STRIPE_WEBHOOK_SECRET: z.string().min(1),
  NEXT_PUBLIC_STRIPE_PUBLIC_KEY: z.string().min(1).optional(),
  GEMINI_API_KEY: z.string().min(1),
})

type Environment = z.infer<typeof mockEnvSchema> | z.infer<typeof realEnvSchema>

let cachedEnv: Environment | null = null

export function validateEnv(): Environment {
  if (cachedEnv) return cachedEnv

  const isProduction = appMode === 'production'
  const isLocal = appMode === 'local'
  const schema = isProduction || isLocal ? realEnvSchema : mockEnvSchema

  try {
    const env = schema.parse({
      NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
      NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY,
      STRIPE_SECRET_KEY: process.env.STRIPE_SECRET_KEY,
      STRIPE_WEBHOOK_SECRET: process.env.STRIPE_WEBHOOK_SECRET,
      NEXT_PUBLIC_STRIPE_PUBLIC_KEY: process.env.NEXT_PUBLIC_STRIPE_PUBLIC_KEY,
      NEXT_PUBLIC_APP_MODE: process.env.NEXT_PUBLIC_APP_MODE,
      GEMINI_API_KEY: process.env.GEMINI_API_KEY,
    })

    cachedEnv = env
    return env
  } catch (error) {
    if (error instanceof z.ZodError) {
      const issues = error.issues
        .map((err) => `${err.path.join('.')}: ${err.message}`)
        .join('\n')

      const modeHint = isProduction
        ? '\n\n💡 Production mode requires ALL real credentials. Use NEXT_PUBLIC_APP_MODE=development for local development with mocks.'
        : ''

      const message = `❌ Environment validation failed:\n${issues}${modeHint}`
      console.error(message)

      if (typeof window === 'undefined') {
        throw new Error(message)
      } else {
        console.error(message)
        return {} as Environment
      }
    }
    throw error
  }
}

if (typeof window === 'undefined') {
  validateEnv()
}
