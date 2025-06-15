
-- Create referral_codes table to store unique referral codes for each user
CREATE TABLE public.referral_codes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  profile_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  referral_code VARCHAR(20) NOT NULL UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT timezone('utc'::text, now()),
  is_active BOOLEAN NOT NULL DEFAULT true
);

-- Create user_referrals table to track referral relationships
CREATE TABLE public.user_referrals (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  referrer_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  referred_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  referral_code VARCHAR(20) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT timezone('utc'::text, now()),
  registration_completed_at TIMESTAMP WITH TIME ZONE NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'cancelled')),
  UNIQUE(referred_id) -- Each user can only be referred once
);

-- Create referral_rewards table to track rewards given for referrals
CREATE TABLE public.referral_rewards (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  referral_id UUID NOT NULL REFERENCES public.user_referrals(id) ON DELETE CASCADE,
  referrer_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  referred_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  reward_amount INTEGER NOT NULL DEFAULT 15,
  reward_type TEXT NOT NULL DEFAULT 'tokens',
  awarded_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT timezone('utc'::text, now()),
  transaction_id UUID NULL REFERENCES public.token_transactions(id)
);

-- Add RLS policies for referral_codes
ALTER TABLE public.referral_codes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own referral codes" 
  ON public.referral_codes 
  FOR SELECT 
  USING (auth.uid() = profile_id);

CREATE POLICY "Users can create their own referral codes" 
  ON public.referral_codes 
  FOR INSERT 
  WITH CHECK (auth.uid() = profile_id);

CREATE POLICY "Users can update their own referral codes" 
  ON public.referral_codes 
  FOR UPDATE 
  USING (auth.uid() = profile_id);

-- Add RLS policies for user_referrals
ALTER TABLE public.user_referrals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view referrals they made or received" 
  ON public.user_referrals 
  FOR SELECT 
  USING (auth.uid() = referrer_id OR auth.uid() = referred_id);

CREATE POLICY "Allow inserting referrals during registration" 
  ON public.user_referrals 
  FOR INSERT 
  WITH CHECK (true); -- This will be restricted by the application logic

-- Add RLS policies for referral_rewards
ALTER TABLE public.referral_rewards ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view rewards they earned or received" 
  ON public.referral_rewards 
  FOR SELECT 
  USING (auth.uid() = referrer_id OR auth.uid() = referred_id);

-- Create function to generate unique referral code
CREATE OR REPLACE FUNCTION public.generate_referral_code(p_profile_id UUID)
RETURNS VARCHAR(20)
LANGUAGE plpgsql
SECURITY DEFINER
AS $function$
DECLARE
  v_code VARCHAR(20);
  v_counter INTEGER := 0;
  v_base_code VARCHAR(15);
BEGIN
  -- Get first name and last name from profile
  SELECT 
    COALESCE(UPPER(SUBSTRING(first_name FROM 1 FOR 3)), 'USR') || 
    COALESCE(UPPER(SUBSTRING(last_name FROM 1 FOR 3)), 'REF')
  INTO v_base_code
  FROM profiles 
  WHERE id = p_profile_id;
  
  -- If no name found, use generic code
  IF v_base_code IS NULL THEN
    v_base_code := 'PICREF';
  END IF;
  
  -- Try to generate unique code
  LOOP
    IF v_counter = 0 THEN
      v_code := v_base_code || LPAD(FLOOR(RANDOM() * 10000)::TEXT, 4, '0');
    ELSE
      v_code := v_base_code || LPAD((FLOOR(RANDOM() * 10000) + v_counter)::TEXT, 4, '0');
    END IF;
    
    -- Check if code is unique
    IF NOT EXISTS (SELECT 1 FROM referral_codes WHERE referral_code = v_code) THEN
      EXIT;
    END IF;
    
    v_counter := v_counter + 1;
    
    -- Prevent infinite loop
    IF v_counter > 100 THEN
      v_code := 'PIC' || EXTRACT(EPOCH FROM NOW())::BIGINT::TEXT;
      EXIT;
    END IF;
  END LOOP;
  
  RETURN v_code;
END;
$function$;

-- Create function to process referral reward
CREATE OR REPLACE FUNCTION public.process_referral_reward(p_referred_id UUID, p_referral_code VARCHAR(20))
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $function$
DECLARE
  v_referrer_id UUID;
  v_referral_id UUID;
  v_referrer_wallet_id UUID;
  v_reward_amount INTEGER := 15;
  v_transaction_result JSONB;
  v_reward_id UUID;
BEGIN
  -- Find the referrer
  SELECT profile_id INTO v_referrer_id
  FROM referral_codes
  WHERE referral_code = p_referral_code AND is_active = true;
  
  IF v_referrer_id IS NULL THEN
    RETURN jsonb_build_object('success', false, 'message', 'Invalid referral code');
  END IF;
  
  -- Check if referral already exists
  IF EXISTS (SELECT 1 FROM user_referrals WHERE referred_id = p_referred_id) THEN
    RETURN jsonb_build_object('success', false, 'message', 'User already referred');
  END IF;
  
  -- Create referral record
  INSERT INTO user_referrals (referrer_id, referred_id, referral_code, registration_completed_at, status)
  VALUES (v_referrer_id, p_referred_id, p_referral_code, NOW(), 'completed')
  RETURNING id INTO v_referral_id;
  
  -- Get referrer's wallet
  SELECT id INTO v_referrer_wallet_id
  FROM wallets
  WHERE profile_id = v_referrer_id;
  
  -- If no wallet exists, create one
  IF v_referrer_wallet_id IS NULL THEN
    INSERT INTO wallets (profile_id, balance)
    VALUES (v_referrer_id, 0)
    RETURNING id INTO v_referrer_wallet_id;
  END IF;
  
  -- Add tokens to referrer's wallet
  UPDATE wallets
  SET balance = balance + v_reward_amount,
      updated_at = NOW()
  WHERE id = v_referrer_wallet_id;
  
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
    v_referrer_wallet_id,
    'credit',
    v_reward_amount,
    'Referral reward for successful friend invitation',
    'completed',
    'bonus',
    jsonb_build_object('referral_code', p_referral_code, 'referred_user_id', p_referred_id)
  ) RETURNING id INTO v_transaction_result;
  
  -- Create reward record
  INSERT INTO referral_rewards (referral_id, referrer_id, referred_id, reward_amount, transaction_id)
  VALUES (v_referral_id, v_referrer_id, p_referred_id, v_reward_amount, (v_transaction_result::TEXT)::UUID)
  RETURNING id INTO v_reward_id;
  
  -- Create notification for referrer
  INSERT INTO notifications (
    profile_id,
    title,
    message,
    type,
    action_url,
    category
  ) VALUES (
    v_referrer_id,
    'Referral Reward Earned!',
    'You earned ' || v_reward_amount || ' tokens for successfully referring a friend to PicoCareer!',
    'reward',
    '/profile?tab=wallet',
    'general'
  );
  
  RETURN jsonb_build_object(
    'success', true,
    'message', 'Referral reward processed successfully',
    'reward_amount', v_reward_amount,
    'referrer_id', v_referrer_id
  );
END;
$function$;

-- Create indexes for better performance
CREATE INDEX idx_referral_codes_profile_id ON public.referral_codes(profile_id);
CREATE INDEX idx_referral_codes_code ON public.referral_codes(referral_code);
CREATE INDEX idx_user_referrals_referrer_id ON public.user_referrals(referrer_id);
CREATE INDEX idx_user_referrals_referred_id ON public.user_referrals(referred_id);
CREATE INDEX idx_referral_rewards_referrer_id ON public.referral_rewards(referrer_id);
