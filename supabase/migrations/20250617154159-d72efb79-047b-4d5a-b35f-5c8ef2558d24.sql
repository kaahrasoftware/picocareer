
-- Create table to track daily login rewards
CREATE TABLE public.user_login_rewards (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  profile_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  reward_date DATE NOT NULL,
  tokens_awarded INTEGER NOT NULL DEFAULT 5,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT timezone('utc'::text, now()),
  UNIQUE(profile_id, reward_date)
);

-- Add RLS policies
ALTER TABLE public.user_login_rewards ENABLE ROW LEVEL SECURITY;

-- Users can view their own login rewards
CREATE POLICY "Users can view their own login rewards" 
  ON public.user_login_rewards 
  FOR SELECT 
  USING (auth.uid() = profile_id);

-- Create index for performance
CREATE INDEX idx_user_login_rewards_profile_date ON public.user_login_rewards(profile_id, reward_date DESC);

-- Function to process daily login reward
CREATE OR REPLACE FUNCTION public.process_daily_login_reward(p_profile_id UUID)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_today_utc DATE := CURRENT_DATE AT TIME ZONE 'UTC';
  v_existing_reward_id UUID;
  v_wallet_id UUID;
  v_transaction_id UUID;
  v_reward_amount INTEGER := 5;
BEGIN
  -- Check if user already received reward today
  SELECT id INTO v_existing_reward_id
  FROM user_login_rewards
  WHERE profile_id = p_profile_id 
    AND reward_date = v_today_utc;
  
  IF v_existing_reward_id IS NOT NULL THEN
    RETURN jsonb_build_object(
      'success', false,
      'message', 'Daily reward already claimed today',
      'already_claimed', true
    );
  END IF;
  
  -- Get or create user's wallet
  SELECT id INTO v_wallet_id
  FROM wallets
  WHERE profile_id = p_profile_id;
  
  IF v_wallet_id IS NULL THEN
    INSERT INTO wallets (profile_id, balance)
    VALUES (p_profile_id, 0)
    RETURNING id INTO v_wallet_id;
  END IF;
  
  -- Add tokens to wallet
  UPDATE wallets
  SET balance = balance + v_reward_amount,
      updated_at = NOW()
  WHERE id = v_wallet_id;
  
  -- Create transaction record
  INSERT INTO token_transactions (
    wallet_id,
    transaction_type,
    amount,
    description,
    transaction_status,
    category,
    metadata
  ) VALUES (
    v_wallet_id,
    'credit',
    v_reward_amount,
    'Daily login reward',
    'completed',
    'bonus',
    jsonb_build_object('reward_type', 'daily_login', 'reward_date', v_today_utc)
  ) RETURNING id INTO v_transaction_id;
  
  -- Create reward record
  INSERT INTO user_login_rewards (
    profile_id,
    reward_date,
    tokens_awarded
  ) VALUES (
    p_profile_id,
    v_today_utc,
    v_reward_amount
  );
  
  RETURN jsonb_build_object(
    'success', true,
    'message', 'Daily login reward granted successfully',
    'tokens_awarded', v_reward_amount,
    'transaction_id', v_transaction_id,
    'reward_date', v_today_utc
  );
  
EXCEPTION WHEN OTHERS THEN
  RETURN jsonb_build_object(
    'success', false,
    'message', 'Error processing daily login reward: ' || SQLERRM
  );
END;
$$;
