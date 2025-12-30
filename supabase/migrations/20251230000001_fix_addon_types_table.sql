/*
  # Fix Add-on Types Table

  This migration ensures the addon_types table exists and has the correct data
  for the payment system to work properly.

  1. Creates addon_types table if not exists
  2. Creates user_addon_credits table if not exists
  3. Inserts the required addon types (optimization, score_check)
  4. Sets up proper RLS policies
*/

-- Create addon_types table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.addon_types (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  type_key text UNIQUE NOT NULL,
  unit_price integer NOT NULL DEFAULT 0,
  description text,
  created_at timestamptz DEFAULT now()
);

-- Create user_addon_credits table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.user_addon_credits (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES public.user_profiles(id) ON DELETE CASCADE,
  addon_type_id uuid NOT NULL REFERENCES public.addon_types(id) ON DELETE CASCADE,
  quantity_purchased integer NOT NULL DEFAULT 0,
  quantity_remaining integer NOT NULL DEFAULT 0,
  purchased_at timestamptz DEFAULT now(),
  expires_at timestamptz,
  payment_transaction_id uuid REFERENCES public.payment_transactions(id)
);

-- Enable RLS
ALTER TABLE public.addon_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_addon_credits ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist (to avoid conflicts)
DROP POLICY IF EXISTS "Anyone can read addon types" ON public.addon_types;
DROP POLICY IF EXISTS "Users can read their own addon credits" ON public.user_addon_credits;
DROP POLICY IF EXISTS "Service role can insert addon credits" ON public.user_addon_credits;
DROP POLICY IF EXISTS "Service role can update addon credits" ON public.user_addon_credits;

-- Create policies for addon_types
CREATE POLICY "Anyone can read addon types"
  ON public.addon_types
  FOR SELECT
  TO public
  USING (true);

-- Create policies for user_addon_credits
CREATE POLICY "Users can read their own addon credits"
  ON public.user_addon_credits
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Service role can insert addon credits"
  ON public.user_addon_credits
  FOR INSERT
  TO service_role
  WITH CHECK (true);

CREATE POLICY "Service role can update addon credits"
  ON public.user_addon_credits
  FOR UPDATE
  TO service_role
  USING (true);

-- Insert addon types (upsert to avoid duplicates)
INSERT INTO public.addon_types (name, type_key, unit_price, description)
VALUES 
  ('JD-Based Optimization', 'optimization', 1900, 'Single JD-based resume optimization credit'),
  ('Resume Score Check', 'score_check', 900, 'Single resume score check credit')
ON CONFLICT (type_key) DO UPDATE SET
  name = EXCLUDED.name,
  unit_price = EXCLUDED.unit_price,
  description = EXCLUDED.description;

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_addon_types_type_key ON public.addon_types(type_key);
CREATE INDEX IF NOT EXISTS idx_user_addon_credits_user_id ON public.user_addon_credits(user_id);
CREATE INDEX IF NOT EXISTS idx_user_addon_credits_addon_type_id ON public.user_addon_credits(addon_type_id);
