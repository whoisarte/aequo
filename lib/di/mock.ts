import type { StripeServiceInterface, MinimumWageServiceInterface, ChatbotServiceInterface } from './types'

const MOCK_MINIMUM_WAGES: Record<string, Record<string, number>> = {
  general: {
    2020: 123.22,
    2021: 141.7,
    2022: 172.87,
    2023: 207.44,
    2024: 248.93,
    2025: 278.8,
    2026: 300.0,
  },
  frontera_norte: {
    2020: 185.56,
    2021: 213.39,
    2022: 260.34,
    2023: 312.41,
    2024: 374.89,
    2025: 419.88,
    2026: 450.0,
  },
}

export const createMockStripeService = (): StripeServiceInterface => ({
  checkout: {
    sessions: {
      create: async (params) => {
        console.log('[MOCK STRIPE] Creating checkout session:', params)
        return {
          id: `mock_session_${Date.now()}`,
          url: `http://localhost:3000/billing/success?mock=true&plan=${params.metadata?.planId || 'unknown'}`,
        }
      },
    },
  },
  subscriptions: {
    update: async (subscriptionId, params) => {
      console.log('[MOCK STRIPE] Updating subscription:', subscriptionId, params)
      return { id: subscriptionId, status: 'canceled' }
    },
  },
})

export const createMockMinimumWageService = (): MinimumWageServiceInterface => ({
  getMinimumWage: async (year, zone) => {
    console.log(`[MOCK] Getting minimum wage for ${year}, zone: ${zone}`)
    return MOCK_MINIMUM_WAGES[zone]?.[year] ?? null
  },
})

const MOCK_CHAT_RESPONSES: Record<string, string> = {
  default: 'Esta es una respuesta simulada del chatbot. Para respuestas reales, configura GEMINI_API_KEY.',
  finiquito: 'El finiquito es la compensación que recibe un trabajador cuando renuncia voluntariamente. Incluye: partes proporcionales de salario, vacaciones, prima vacacional y aguinaldo. (Respuesta simulada)',
  liquidacion: 'La liquidación es la compensación que recibe un trabajador cuando es despedido sin causa justificada. Incluye: 3 meses de salario, 20 días por año trabajado, prima de antigüedad, y partes proporcionales. (Respuesta simulada)',
  aguinaldo: 'El aguinaldo es una prestación mínima de 15 días de salario por año. Debe pagarse antes del 20 de diciembre de cada año. (Respuesta simulada)',
  vacaciones: 'Los trabajadores tienen derecho a 12 días de vacaciones el primer año, que aumentan 2 días por cada año subsecuente hasta llegar a 20 días máximo. (Respuesta simulada)',
}

export const createMockChatbotService = (): ChatbotServiceInterface => ({
  sendMessage: async (userMessage, _conversationHistory) => {
    console.log('[MOCK CHATBOT] Received message:', userMessage)
    await new Promise((resolve) => setTimeout(resolve, 500))

    const lowerMessage = userMessage.toLowerCase()
    let response = MOCK_CHAT_RESPONSES.default

    for (const [keyword, mockResponse] of Object.entries(MOCK_CHAT_RESPONSES)) {
      if (lowerMessage.includes(keyword) && keyword !== 'default') {
        response = mockResponse
        break
      }
    }

    return { success: true, message: response }
  },
})
