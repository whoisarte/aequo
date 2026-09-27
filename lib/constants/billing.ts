export const STRIPE_API_VERSION = '2026-08-26.dahlia' as const;

export const PlanType = {
  Subscription: 'subscription',
  OneTime: 'one_time',
} as const;

export type PlanType = (typeof PlanType)[keyof typeof PlanType];

export const PLAN_LIMITS = {
  Basic: 100,
  Advanced: 250,
  Professional: 500,
  Individual: 1,
} as const;

export const PLAN_PRICES = {
  Basic: 20000,
  Advanced: 35000,
  Professional: 60000,
  Individual: 5000,
} as const;
