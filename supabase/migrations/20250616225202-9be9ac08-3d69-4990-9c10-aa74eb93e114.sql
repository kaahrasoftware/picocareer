
-- Fix the handle_new_user function to properly extract and store referral codes
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER 
SET search_path = ''
AS $$
DECLARE
  v_referral_code TEXT;
BEGIN
  -- Extract referral code from user metadata
  v_referral_code := NEW.raw_user_meta_data->>'referral_code';
  
  -- Log the referral code extraction for debugging
  RAISE NOTICE 'Processing new user %. Referral code from metadata: %', NEW.id, v_referral_code;
  
  -- Insert new profile with referral code
  INSERT INTO public.profiles (
    id, 
    first_name, 
    last_name, 
    email,
    referral_code
  )
  VALUES (
    NEW.id, 
    NEW.raw_user_meta_data->>'first_name', 
    NEW.raw_user_meta_data->>'last_name',
    NEW.email,
    v_referral_code
  );
  
  RAISE NOTICE 'Created profile for user % with referral code %', NEW.id, v_referral_code;
  
  RETURN NEW;
END;
$$;

-- Manually process the missed referral between raf97.to@gmail.com and jgrdsawaksujzjavmg@xfavaj.com
DO $$
DECLARE
  v_referrer_id UUID;
  v_referred_id UUID;
  v_referral_code TEXT;
  v_result JSONB;
BEGIN
  -- Get the referrer (Rafik) profile ID
  SELECT id INTO v_referrer_id
  FROM profiles
  WHERE email = 'raf97.to@gmail.com';
  
  -- Get the referred (Johna) profile ID  
  SELECT id INTO v_referred_id
  FROM profiles
  WHERE email = 'jgrdsawaksujzjavmg@xfavaj.com';
  
  -- Get the referral code for the referrer
  SELECT referral_code INTO v_referral_code
  FROM referral_codes
  WHERE profile_id = v_referrer_id;
  
  -- Log what we found
  RAISE NOTICE 'Referrer ID: %, Referred ID: %, Referral Code: %', v_referrer_id, v_referred_id, v_referral_code;
  
  -- Only proceed if we have both users and a referral code
  IF v_referrer_id IS NOT NULL AND v_referred_id IS NOT NULL AND v_referral_code IS NOT NULL THEN
    -- Check if referral already exists to avoid duplicates
    IF NOT EXISTS (SELECT 1 FROM user_referrals WHERE referred_id = v_referred_id) THEN
      -- Process the referral reward
      SELECT process_referral_reward(v_referred_id, v_referral_code) INTO v_result;
      
      RAISE NOTICE 'Processed missed referral: %', v_result;
    ELSE
      RAISE NOTICE 'Referral already exists for user %', v_referred_id;
    END IF;
  ELSE
    RAISE NOTICE 'Missing data - Referrer: %, Referred: %, Code: %', v_referrer_id, v_referred_id, v_referral_code;
  END IF;
END;
$$;

-- Add better error handling and logging to the process_referral_from_profile function
CREATE OR REPLACE FUNCTION public.process_referral_from_profile()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_referral_code TEXT;
  v_result JSONB;
BEGIN
  -- Get referral code from the new profile
  v_referral_code := NEW.referral_code;
  
  RAISE NOTICE 'Profile created for user %. Referral code: %', NEW.id, v_referral_code;
  
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
    
    RAISE NOTICE 'Cleared referral code from profile %', NEW.id;
  ELSE
    RAISE NOTICE 'No referral code to process for profile %', NEW.id;
  END IF;
  
  RETURN NEW;
END;
$$;

-- Create a function to manually process missed referrals (admin tool)
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
  v_referral_code TEXT;
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
  
  -- Process the referral
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
