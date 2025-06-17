
-- First, create the referral_codes table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.referral_codes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  profile_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  referral_code VARCHAR(20) NOT NULL UNIQUE,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
  UNIQUE(profile_id)
);

-- Create the user_referrals table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.user_referrals (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  referrer_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  referred_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  referral_code VARCHAR(20) NOT NULL,
  registration_completed_at TIMESTAMP WITH TIME ZONE,
  status VARCHAR(20) DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
  UNIQUE(referred_id)
);

-- Create the referral_rewards table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.referral_rewards (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  referral_id UUID NOT NULL REFERENCES public.user_referrals(id) ON DELETE CASCADE,
  referrer_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  referred_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  reward_amount INTEGER NOT NULL DEFAULT 15,
  transaction_id UUID REFERENCES public.token_transactions(id),
  awarded_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- Add RLS policies
ALTER TABLE public.referral_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_referrals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.referral_rewards ENABLE ROW LEVEL SECURITY;

-- RLS policies for referral_codes
CREATE POLICY "Users can view their own referral code" ON public.referral_codes
  FOR SELECT USING (auth.uid() = profile_id);

CREATE POLICY "Users can update their own referral code" ON public.referral_codes
  FOR UPDATE USING (auth.uid() = profile_id);

-- RLS policies for user_referrals
CREATE POLICY "Users can view referrals they're involved in" ON public.user_referrals
  FOR SELECT USING (auth.uid() = referrer_id OR auth.uid() = referred_id);

-- RLS policies for referral_rewards
CREATE POLICY "Users can view their own referral rewards" ON public.referral_rewards
  FOR SELECT USING (auth.uid() = referrer_id OR auth.uid() = referred_id);

-- Now insert referral codes for existing users
INSERT INTO referral_codes (profile_id, referral_code, is_active)
SELECT 
  id,
  UPPER(SUBSTRING(REPLACE(gen_random_uuid()::text, '-', ''), 1, 8)) as referral_code,
  true
FROM profiles 
WHERE id NOT IN (SELECT profile_id FROM referral_codes WHERE profile_id IS NOT NULL)
ON CONFLICT (profile_id) DO NOTHING;

-- Update the process_referral_reward function to give tokens to both parties
CREATE OR REPLACE FUNCTION public.process_referral_reward(p_referred_id UUID, p_referral_code VARCHAR(20))
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_referrer_id UUID;
  v_referral_id UUID;
  v_referrer_wallet_id UUID;
  v_referred_wallet_id UUID;
  v_reward_amount INTEGER := 15;
  v_transaction_id UUID;
  v_referred_transaction_id UUID;
  v_reward_id UUID;
  v_referrer_profile RECORD;
  v_referred_profile RECORD;
BEGIN
  -- Log the start of processing
  RAISE NOTICE 'Starting referral reward processing for user % with code %', p_referred_id, p_referral_code;
  
  -- Find the referrer by referral code
  SELECT profile_id INTO v_referrer_id
  FROM referral_codes
  WHERE referral_code = p_referral_code AND is_active = true;
  
  IF v_referrer_id IS NULL THEN
    RAISE NOTICE 'Invalid referral code: %', p_referral_code;
    RETURN jsonb_build_object('success', false, 'message', 'Invalid referral code');
  END IF;
  
  -- Prevent self-referral
  IF v_referrer_id = p_referred_id THEN
    RAISE NOTICE 'Self-referral attempt blocked for user: %', p_referred_id;
    RETURN jsonb_build_object('success', false, 'message', 'Cannot refer yourself');
  END IF;
  
  -- Check if referral already exists
  IF EXISTS (SELECT 1 FROM user_referrals WHERE referred_id = p_referred_id) THEN
    RAISE NOTICE 'User % already has a referral record', p_referred_id;
    RETURN jsonb_build_object('success', false, 'message', 'User already referred');
  END IF;
  
  -- Get profile information for notifications
  SELECT first_name, last_name INTO v_referrer_profile
  FROM profiles WHERE id = v_referrer_id;
  
  SELECT first_name, last_name INTO v_referred_profile
  FROM profiles WHERE id = p_referred_id;
  
  -- Create referral record
  INSERT INTO user_referrals (referrer_id, referred_id, referral_code, registration_completed_at, status)
  VALUES (v_referrer_id, p_referred_id, p_referral_code, NOW(), 'completed')
  RETURNING id INTO v_referral_id;
  
  RAISE NOTICE 'Created referral record with id: %', v_referral_id;
  
  -- Get or create referrer's wallet
  SELECT id INTO v_referrer_wallet_id
  FROM wallets
  WHERE profile_id = v_referrer_id;
  
  IF v_referrer_wallet_id IS NULL THEN
    INSERT INTO wallets (profile_id, balance)
    VALUES (v_referrer_id, 0)
    RETURNING id INTO v_referrer_wallet_id;
    
    RAISE NOTICE 'Created new wallet for referrer: %', v_referrer_wallet_id;
  END IF;
  
  -- Get or create referred user's wallet
  SELECT id INTO v_referred_wallet_id
  FROM wallets
  WHERE profile_id = p_referred_id;
  
  IF v_referred_wallet_id IS NULL THEN
    INSERT INTO wallets (profile_id, balance)
    VALUES (p_referred_id, 0)
    RETURNING id INTO v_referred_wallet_id;
    
    RAISE NOTICE 'Created new wallet for referred user: %', v_referred_wallet_id;
  END IF;
  
  -- Add tokens to referrer's wallet
  UPDATE wallets
  SET balance = balance + v_reward_amount,
      updated_at = NOW()
  WHERE id = v_referrer_wallet_id;
  
  RAISE NOTICE 'Added % tokens to referrer wallet %', v_reward_amount, v_referrer_wallet_id;
  
  -- Add tokens to referred user's wallet (welcome bonus)
  UPDATE wallets
  SET balance = balance + v_reward_amount,
      updated_at = NOW()
  WHERE id = v_referred_wallet_id;
  
  RAISE NOTICE 'Added % welcome tokens to referred user wallet %', v_reward_amount, v_referred_wallet_id;
  
  -- Create transaction record for referrer
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
    'Referral reward for successfully referring ' || COALESCE(v_referred_profile.first_name || ' ' || v_referred_profile.last_name, 'a friend'),
    'completed',
    'bonus',
    jsonb_build_object('referral_code', p_referral_code, 'referred_user_id', p_referred_id, 'referred_name', COALESCE(v_referred_profile.first_name || ' ' || v_referred_profile.last_name, 'Unknown'))
  ) RETURNING id INTO v_transaction_id;
  
  -- Create transaction record for referred user (welcome bonus)
  INSERT INTO token_transactions (
    wallet_id,
    transaction_type,
    amount,
    description,
    transaction_status,
    category,
    metadata
  ) VALUES (
    v_referred_wallet_id,
    'credit',
    v_reward_amount,
    'Welcome bonus for joining PicoCareer through referral',
    'completed',
    'bonus',
    jsonb_build_object('referral_code', p_referral_code, 'referrer_id', v_referrer_id, 'referrer_name', COALESCE(v_referrer_profile.first_name || ' ' || v_referrer_profile.last_name, 'Unknown'))
  ) RETURNING id INTO v_referred_transaction_id;
  
  -- Create reward record
  INSERT INTO referral_rewards (referral_id, referrer_id, referred_id, reward_amount, transaction_id)
  VALUES (v_referral_id, v_referrer_id, p_referred_id, v_reward_amount, v_transaction_id)
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
    'Referral Reward Earned! 🎉',
    'You earned ' || v_reward_amount || ' tokens for successfully referring ' || COALESCE(v_referred_profile.first_name || ' ' || v_referred_profile.last_name, 'a friend') || ' to PicoCareer!',
    'reward',
    '/profile?tab=wallet',
    'general'
  );
  
  -- Create notification for referred user
  INSERT INTO notifications (
    profile_id,
    title,
    message,
    type,
    action_url,
    category
  ) VALUES (
    p_referred_id,
    'Welcome Bonus! 🎉',
    'You received ' || v_reward_amount || ' tokens as a welcome bonus for joining PicoCareer through a referral!',
    'reward',
    '/profile?tab=wallet',
    'general'
  );
  
  RAISE NOTICE 'Successfully processed referral reward. Referrer Transaction ID: %, Referred Transaction ID: %, Reward ID: %', v_transaction_id, v_referred_transaction_id, v_reward_id;
  
  RETURN jsonb_build_object(
    'success', true,
    'message', 'Referral reward processed successfully',
    'reward_amount', v_reward_amount,
    'referrer_id', v_referrer_id,
    'referred_id', p_referred_id,
    'referrer_transaction_id', v_transaction_id,
    'referred_transaction_id', v_referred_transaction_id,
    'referral_id', v_referral_id
  );
  
EXCEPTION WHEN OTHERS THEN
  RAISE NOTICE 'Error processing referral reward: %', SQLERRM;
  RETURN jsonb_build_object(
    'success', false,
    'message', 'Error processing referral: ' || SQLERRM
  );
END;
$$;

-- Create trigger to generate referral codes for new users
CREATE OR REPLACE FUNCTION public.generate_referral_code_for_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Generate a unique referral code for the new user
  INSERT INTO referral_codes (profile_id, referral_code, is_active)
  VALUES (
    NEW.id,
    UPPER(SUBSTRING(REPLACE(gen_random_uuid()::text, '-', ''), 1, 8)),
    true
  )
  ON CONFLICT (profile_id) DO NOTHING;
  
  RETURN NEW;
END;
$$;

-- Create trigger to automatically generate referral codes when profiles are created
DROP TRIGGER IF EXISTS trigger_generate_referral_code ON public.profiles;
CREATE TRIGGER trigger_generate_referral_code
  AFTER INSERT ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.generate_referral_code_for_new_user();

-- Update the handle_new_user function to process referrals from URL
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER 
SET search_path = ''
AS $$
DECLARE
  v_referral_code TEXT;
BEGIN
  -- Log the start of user creation
  RAISE NOTICE 'Creating new user profile for user ID: %', NEW.id;
  
  -- Extract referral code from user metadata
  v_referral_code := NEW.raw_user_meta_data->>'referral_code';
  
  -- Insert new profile with basic data
  INSERT INTO public.profiles (
    id, 
    first_name, 
    last_name, 
    email,
    user_type
  )
  VALUES (
    NEW.id, 
    NEW.raw_user_meta_data->>'first_name', 
    NEW.raw_user_meta_data->>'last_name',
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'user_type', 'mentee')
  );
  
  -- Process referral if we have a referral code
  IF v_referral_code IS NOT NULL AND v_referral_code != '' THEN
    -- Add a small delay to ensure profile is committed
    PERFORM pg_sleep(0.5);
    
    -- Process the referral reward
    PERFORM process_referral_reward(NEW.id, v_referral_code);
    
    RAISE NOTICE 'Processed referral for new user % with code %', NEW.id, v_referral_code;
  END IF;
  
  -- Log successful profile creation
  RAISE NOTICE 'Successfully created profile for user %', NEW.id;
  
  RETURN NEW;
  
EXCEPTION WHEN OTHERS THEN
  -- Log any errors but don't fail the user creation
  RAISE WARNING 'Error in handle_new_user for user %: % - %', NEW.id, SQLSTATE, SQLERRM;
  
  -- Try to create a basic profile to prevent signup failure
  INSERT INTO public.profiles (
    id, 
    first_name, 
    last_name, 
    email,
    user_type
  )
  VALUES (
    NEW.id, 
    NEW.raw_user_meta_data->>'first_name', 
    NEW.raw_user_meta_data->>'last_name',
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'user_type', 'mentee')
  )
  ON CONFLICT (id) DO NOTHING;
  
  RETURN NEW;
END;
$$;
