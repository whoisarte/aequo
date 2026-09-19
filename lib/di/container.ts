import type { DIContainer, EnvironmentMode, StripeServiceInterface, MinimumWageServiceInterface, ChatbotServiceInterface } from './types'
import { createMockSupabaseClient, type MockSupabaseClient } from './mock-supabase'

export const getMode = (): EnvironmentMode => {
  if (process.env.NEXT_PUBLIC_APP_MODE === 'production') return 'production'
  if (process.env.NODE_ENV === 'production') return 'production'
  if (process.env.NEXT_PUBLIC_APP_MODE === 'local') return 'local'
  return 'development'
}

const mode = getMode()
const isMockMode = mode === 'local'

console.log(`[DI Container] Initializing in ${mode} mode (mock: ${isMockMode})`)

let mockSupabase: MockSupabaseClient | null = null
let realSupabaseAdmin: unknown = null

const getSupabaseAdmin = (): unknown => {
  if (isMockMode) {
    if (!mockSupabase) {
      mockSupabase = createMockSupabaseClient()
    }
    return mockSupabase
  }
  if (!realSupabaseAdmin) {
    const { createClient } = require('@supabase/supabase-js')
    realSupabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL ?? 'http://localhost:54321',
      process.env.SUPABASE_SERVICE_ROLE_KEY ?? 'mock_service_role_key'
    )
  }
  return realSupabaseAdmin
}

const getSupabaseClient = (): unknown => {
  if (isMockMode) {
    if (!mockSupabase) {
      mockSupabase = createMockSupabaseClient()
    }
    return mockSupabase
  }
  const { createBrowserClient } = require('@supabase/ssr')
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL ?? 'http://localhost:54321',
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? 'mock_anon_key'
  )
}

const getSupabaseServer = async (): Promise<unknown> => {
  if (isMockMode) {
    if (!mockSupabase) {
      mockSupabase = createMockSupabaseClient()
    }
    return mockSupabase
  }
  const { createServerClient } = require('@supabase/ssr')
  const { cookies } = require('next/headers')
  const cookieStore = await cookies()
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL ?? 'http://localhost:54321',
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? 'mock_anon_key',
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value
        },
        set(name: string, value: string, options: unknown) {
          try {
            cookieStore.set(name, value, options as Parameters<typeof cookieStore.set>[0])
          } catch {}
        },
        remove(name: string, options: unknown) {
          try {
            cookieStore.set(name, '', options as Parameters<typeof cookieStore.set>[0])
          } catch {}
        },
      },
    }
  )
}

const getStripeService = (): StripeServiceInterface => {
  if (isMockMode) {
    const { createMockStripeService } = require('./mock')
    return createMockStripeService()
  }
  const { createRealStripeService } = require('./providers')
  return createRealStripeService()
}

const getChatbotService = (): ChatbotServiceInterface => {
  if (isMockMode) {
    const { createMockChatbotService } = require('./mock')
    return createMockChatbotService()
  }
  const { createRealChatbotService } = require('./providers')
  return createRealChatbotService()
}

const getMinimumWageService = (): MinimumWageServiceInterface => {
  if (isMockMode) {
    const { createMockMinimumWageService } = require('./mock')
    return createMockMinimumWageService()
  }
  const { createRealMinimumWageService } = require('./providers')
  return createRealMinimumWageService()
}

const container: DIContainer = {
  mode,
  supabase: {
    client: getSupabaseClient,
    server: getSupabaseServer,
    admin: getSupabaseAdmin,
  },
  stripe: getStripeService(),
  chatbot: getChatbotService(),
  minimumWage: getMinimumWageService(),
}

export { container, mode, isMockMode }
export const isMock = (): boolean => isMockMode
