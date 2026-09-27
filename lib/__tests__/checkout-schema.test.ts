import { describe, it, expect } from 'vitest'
import { checkoutSchema } from '../forms/schemas'

describe('checkoutSchema', () => {
  describe('planId validation', () => {
    it('accepts a non-empty planId', () => {
      const result = checkoutSchema.safeParse({ planId: 'plan_123', mode: 'subscription' })
      expect(result.success).toBe(true)
    })

    it('rejects an empty planId', () => {
      const result = checkoutSchema.safeParse({ planId: '', mode: 'subscription' })
      expect(result.success).toBe(false)
    })

    it('rejects a missing planId', () => {
      const result = checkoutSchema.safeParse({ mode: 'subscription' })
      expect(result.success).toBe(false)
    })
  })

  describe('mode validation', () => {
    it('accepts mode: subscription', () => {
      const result = checkoutSchema.safeParse({ planId: 'plan_123', mode: 'subscription' })
      expect(result.success).toBe(true)
    })

    it('accepts mode: payment', () => {
      const result = checkoutSchema.safeParse({ planId: 'plan_123', mode: 'payment' })
      expect(result.success).toBe(true)
    })

    it('accepts mode: subscription by default when omitted', () => {
      const result = checkoutSchema.safeParse({ planId: 'plan_123' })
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.mode).toBe('subscription')
      }
    })

    it('rejects an invalid mode value', () => {
      const result = checkoutSchema.safeParse({ planId: 'plan_123', mode: 'invalid' as any })
      expect(result.success).toBe(false)
    })
  })

  describe('integration: both fields', () => {
    it('accepts a valid subscription checkout payload', () => {
      const result = checkoutSchema.safeParse({
        planId: '550e8400-e29b-41d4-a716-446655440000',
        mode: 'subscription',
      })
      expect(result.success).toBe(true)
    })

    it('accepts a valid one-time payment payload', () => {
      const result = checkoutSchema.safeParse({
        planId: '550e8400-e29b-41d4-a716-446655440001',
        mode: 'payment',
      })
      expect(result.success).toBe(true)
    })

    it('rejects a payload with no fields', () => {
      const result = checkoutSchema.safeParse({})
      expect(result.success).toBe(false)
    })
  })
})
