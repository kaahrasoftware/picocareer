
-- Add referral_code column to profiles table
ALTER TABLE public.profiles 
ADD COLUMN referral_code VARCHAR(20) NULL;

-- Create index for faster lookups
CREATE INDEX idx_profiles_referral_code ON public.profiles(referral_code);

-- Drop the existing trigger that's not working
DROP TRIGGER IF EXISTS trigger_process_referral_from_metadata ON public.profiles;
DROP FUNCTION IF EXISTS public.process_referral_from_metadata();

-- Create improved function to process referrals from profile data
CREATE OR REPLACE FUNCTION public.process_referral_from_profile()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $function$
DECLARE
  v_referral_code TEXT;
  v_result JSONB;
BEGIN
  -- Get referral code from the new profile
  v_referral_code := NEW.referral_code;
  
  -- If we have a referral code, process it
  IF v_referral_code IS NOT NULL AND v_referral_code != '' THEN
    -- Small delay to ensure everything is properly committed
    PERFORM pg_sleep(0.5);
    
    -- Process the referral reward
    SELECT process_referral_reward(NEW.id, v_referral_code) INTO v_result;
    
    -- Log the result
    RAISE NOTICE 'Processed referral reward for profile % with code %: %', NEW.id, v_referral_code, v_result;
    
    -- Clear the referral code from profile after processing to prevent reprocessing
    UPDATE profiles 
    SET referral_code = NULL 
    WHERE id = NEW.id;
  END IF;
  
  RETURN NEW;
END;
$function$;

-- Create new trigger to process referrals when profiles are created/updated
CREATE TRIGGER trigger_process_referral_from_profile
  AFTER INSERT OR UPDATE ON public.profiles
  FOR EACH ROW
  WHEN (NEW.referral_code IS NOT NULL AND NEW.referral_code != '')
  EXECUTE FUNCTION public.process_referral_from_profile();

-- Improve the process_referral_reward function with better error handling
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
  v_transaction_id UUID;
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
  
  -- Add tokens to referrer's wallet
  UPDATE wallets
  SET balance = balance + v_reward_amount,
      updated_at = NOW()
  WHERE id = v_referrer_wallet_id;
  
  RAISE NOTICE 'Added % tokens to wallet %', v_reward_amount, v_referrer_wallet_id;
  
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
    'Referral reward for successfully referring ' || COALESCE(v_referred_profile.first_name || ' ' || v_referred_profile.last_name, 'a friend'),
    'completed',
    'bonus',
    jsonb_build_object('referral_code', p_referral_code, 'referred_user_id', p_referred_id, 'referred_name', COALESCE(v_referred_profile.first_name || ' ' || v_referred_profile.last_name, 'Unknown'))
  ) RETURNING id INTO v_transaction_id;
  
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
  
  RAISE NOTICE 'Successfully processed referral reward. Transaction ID: %, Reward ID: %', v_transaction_id, v_reward_id;
  
  RETURN jsonb_build_object(
    'success', true,
    'message', 'Referral reward processed successfully',
    'reward_amount', v_reward_amount,
    'referrer_id', v_referrer_id,
    'transaction_id', v_transaction_id,
    'referral_id', v_referral_id
  );
  
EXCEPTION WHEN OTHERS THEN
  RAISE NOTICE 'Error processing referral reward: %', SQLERRM;
  RETURN jsonb_build_object(
    'success', false,
    'message', 'Error processing referral: ' || SQLERRM
  );
END;
$function$;
