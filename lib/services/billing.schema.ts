import { z } from 'zod';

export const SubscriptionPlanSchema = z.object({
  planId: z.string().uuid(),
  stripePriceId: z.string(),
});

export const CreateCheckoutSessionSchema = z.object({
  planId: z.string().uuid(),
});

export type SubscriptionPlan = z.infer<typeof SubscriptionPlanSchema>;
