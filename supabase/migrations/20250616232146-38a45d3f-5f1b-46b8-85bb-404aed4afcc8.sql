
-- Fix the type mismatch in process_referral_from_profile function
CREATE OR REPLACE FUNCTION public.process_referral_from_profile()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_referral_code CHARACTER VARYING(20);  -- Changed from TEXT to CHARACTER VARYING to match function signature
  v_result JSONB;
BEGIN
  -- Get referral code from the new profile
  v_referral_code := NEW.referral_code;
  
  RAISE NOTICE 'Profile created for user %. Referral code: %', NEW.id, v_referral_code;
  
  -- If we have a referral code, process it
  IF v_referral_code IS NOT NULL AND v_referral_code != '' THEN
    -- Small delay to ensure everything is properly committed
    PERFORM pg_sleep(0.5);
    
    -- Process the referral reward (now with correct type)
    SELECT process_referral_reward(NEW.id, v_referral_code) INTO v_result;
    
    -- Log the result
    RAISE NOTICE 'Processed referral reward for profile % with code %: %', NEW.id, v_referral_code, v_result;
    
    -- Clear the referral code from profile after processing to prevent reprocessing
    UPDATE profiles 
    SET referral_code = NULL 
    WHERE id = NEW.id;
    
    RAISE NOTICE 'Cleared referral code from profile %', NEW.id;
  ELSE
    RAISE NOTICE 'No referral code to process for profile %', NEW.id;
  END IF;
  
  RETURN NEW;
END;
$$;

-- Also fix the manual_process_referral function for consistency
CREATE OR REPLACE FUNCTION public.manual_process_referral(
  p_referrer_email TEXT,
  p_referred_email TEXT
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_referrer_id UUID;
  v_referred_id UUID;
  v_referral_code CHARACTER VARYING(20);  -- Changed from TEXT to CHARACTER VARYING
  v_result JSONB;
BEGIN
  -- Get referrer profile
  SELECT id INTO v_referrer_id
  FROM profiles
  WHERE email = p_referrer_email;
  
  -- Get referred profile
  SELECT id INTO v_referred_id
  FROM profiles
  WHERE email = p_referred_email;
  
  -- Get referral code
  SELECT referral_code INTO v_referral_code
  FROM referral_codes
  WHERE profile_id = v_referrer_id;
  
  -- Validate we have everything needed
  IF v_referrer_id IS NULL THEN
    RETURN jsonb_build_object('success', false, 'message', 'Referrer not found');
  END IF;
  
  IF v_referred_id IS NULL THEN
    RETURN jsonb_build_object('success', false, 'message', 'Referred user not found');
  END IF;
  
  IF v_referral_code IS NULL THEN
    RETURN jsonb_build_object('success', false, 'message', 'Referral code not found');
  END IF;
  
  -- Check if referral already processed
  IF EXISTS (SELECT 1 FROM user_referrals WHERE referred_id = v_referred_id) THEN
    RETURN jsonb_build_object('success', false, 'message', 'Referral already processed');
  END IF;
  
  -- Process the referral (now with correct type)
  SELECT process_referral_reward(v_referred_id, v_referral_code) INTO v_result;
  
  RETURN jsonb_build_object(
    'success', true,
    'message', 'Manual referral processed successfully',
    'referrer_id', v_referrer_id,
    'referred_id', v_referred_id,
    'referral_code', v_referral_code,
    'result', v_result
  );
END;
$$;
