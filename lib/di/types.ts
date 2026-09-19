export type EnvironmentMode = 'production' | 'development' | 'local'

export interface StripeServiceInterface {
  checkout: {
    sessions: {
      create: (params: {
        payment_method_types: string[]
        customer: string
        line_items: { price: string; quantity: number }[]
        mode: 'subscription' | 'payment'
        success_url: string
        cancel_url: string
        metadata: Record<string, string>
      }) => Promise<{ id: string; url: string }>
    }
  }
  subscriptions: {
    update: (subscriptionId: string, params: { cancel_at_period_end: boolean }) => Promise<unknown>
  }
}

export interface ChatbotServiceInterface {
  sendMessage: (
    userMessage: string,
    conversationHistory: { role: string; content: string }[]
  ) => Promise<{ success: boolean; message?: string; error?: string }>
}

export interface MinimumWageServiceInterface {
  getMinimumWage: (year: number, zone: 'general' | 'frontera_norte') => Promise<number | null>
}

export interface DIContainer {
  mode: EnvironmentMode
  supabase: {
    client: () => unknown
    server: () => Promise<unknown>
    admin: () => unknown
  }
  stripe: StripeServiceInterface
  chatbot: ChatbotServiceInterface
  minimumWage: MinimumWageServiceInterface
}
