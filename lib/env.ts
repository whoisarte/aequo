import { z } from 'zod'

const envSchema = z.object({
  NEXT_PUBLIC_SUPABASE_URL: z.string().url('Invalid Supabase URL'),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z
    .string()
    .min(1, 'Supabase anon key is required'),
  SUPABASE_SERVICE_ROLE_KEY: z
    .string()
    .min(1, 'Supabase service role key is required'),
  STRIPE_SECRET_KEY: z.string().min(1, 'Stripe secret key is required'),
  STRIPE_WEBHOOK_SECRET: z.string().min(1, 'Stripe webhook secret is required'),
  NEXT_PUBLIC_STRIPE_PUBLIC_KEY: z
    .string()
    .min(1, 'Stripe public key is required')
    .optional(),
})

type Environment = z.infer<typeof envSchema>

let cachedEnv: Environment | null = null

export function validateEnv(): Environment {
  if (cachedEnv) return cachedEnv

  try {
    const env = envSchema.parse({
      NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
      NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY,
      STRIPE_SECRET_KEY: process.env.STRIPE_SECRET_KEY,
      STRIPE_WEBHOOK_SECRET: process.env.STRIPE_WEBHOOK_SECRET,
      NEXT_PUBLIC_STRIPE_PUBLIC_KEY: process.env.NEXT_PUBLIC_STRIPE_PUBLIC_KEY,
    })

    cachedEnv = env
    return env
  } catch (error) {
    if (error instanceof z.ZodError) {
      const issues = error.issues
        .map((err) => `${err.path.join('.')}: ${err.message}`)
        .join('\n')

      const message = `❌ Environment validation failed:\n${issues}`
      console.error(message)

      if (typeof window === 'undefined') {
        // Server-side: throw during build/startup
        throw new Error(message)
      } else {
        // Client-side: log but don't crash (already running)
        console.error(message)
        return {} as Environment // Graceful degradation
      }
    }
    throw error
  }
}

// Validate on module load (server-side only)
if (typeof window === 'undefined') {
  validateEnv()
}

