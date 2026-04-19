-- Migration: Add webhook_events table for idempotency tracking
-- Run this in Supabase SQL Editor to create the table

CREATE TABLE IF NOT EXISTS webhook_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id TEXT NOT NULL UNIQUE,
  event_type TEXT NOT NULL,
  processed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  body JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Index for fast lookup by event_id
CREATE INDEX IF NOT EXISTS idx_webhook_events_event_id ON webhook_events(event_id);

-- Index for cleanup (old events)
CREATE INDEX IF NOT EXISTS idx_webhook_events_created_at ON webhook_events(created_at);

-- Add RLS policy (optional, but recommended for security)
ALTER TABLE webhook_events ENABLE ROW LEVEL SECURITY;

-- Allow service role full access (webhooks run with service role)
CREATE POLICY "Service role has full access" ON webhook_events
  AS PERMISSIVE
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- Notes:
-- 1. Run the SQL above in Supabase dashboard
-- 2. Then deploy the updated route.ts file
-- 3. To clean up old events (older than 30 days):
--    DELETE FROM webhook_events WHERE created_at < now() - interval '30 days';
