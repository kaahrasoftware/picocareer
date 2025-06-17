
-- Comprehensive fix for referral registration issues
-- This migration updates handle_new_user() to properly extract and store referral codes
-- and adds detailed logging for debugging

-- Update the handle_new_user function with comprehensive logging and error handling
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER 
SET search_path = ''
AS $$
DECLARE
  v_referral_code TEXT;
  v_user_metadata JSONB;
BEGIN
  -- Log the start of user creation
  RAISE NOTICE 'Creating new user profile for user ID: %', NEW.id;
  
  -- Get the full metadata for debugging
  v_user_metadata := NEW.raw_user_meta_data;
  RAISE NOTICE 'Raw user metadata: %', v_user_metadata;
  
  -- Extract referral code from user metadata with multiple fallback methods
  v_referral_code := COALESCE(
    NEW.raw_user_meta_data->>'referral_code',
    NEW.raw_user_meta_data->>'referralCode',
    NEW.raw_user_meta_data->>'ref'
  );
  
  -- Log what we extracted
  RAISE NOTICE 'Extracted referral code: % for user %', COALESCE(v_referral_code, 'NULL'), NEW.id;
  
  -- Insert new profile with all the data including referral code
  INSERT INTO public.profiles (
    id, 
    first_name, 
    last_name, 
    email,
    referral_code,
    user_type
  )
  VALUES (
    NEW.id, 
    NEW.raw_user_meta_data->>'first_name', 
    NEW.raw_user_meta_data->>'last_name',
    NEW.email,
    v_referral_code,
    COALESCE(NEW.raw_user_meta_data->>'user_type', 'mentee')
  );
  
  -- Log successful profile creation
  RAISE NOTICE 'Successfully created profile for user % with referral code: %', 
    NEW.id, COALESCE(v_referral_code, 'NULL');
  
  RETURN NEW;
  
EXCEPTION WHEN OTHERS THEN
  -- Log any errors but don't fail the user creation
  RAISE WARNING 'Error in handle_new_user for user %: % - %', NEW.id, SQLSTATE, SQLERRM;
  
  -- Try to create a basic profile without referral code to prevent signup failure
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

-- Also update the process_referral_from_profile function to be more robust
CREATE OR REPLACE FUNCTION public.process_referral_from_profile()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_referral_code CHARACTER VARYING(20);
  v_result JSONB;
BEGIN
  -- Get referral code from the new profile
  v_referral_code := NEW.referral_code;
  
  RAISE NOTICE 'process_referral_from_profile triggered for user %. Referral code: %', 
    NEW.id, COALESCE(v_referral_code, 'NULL');
  
  -- If we have a referral code, process it
  IF v_referral_code IS NOT NULL AND v_referral_code != '' THEN
    RAISE NOTICE 'Processing referral for user % with code %', NEW.id, v_referral_code;
    
    -- Small delay to ensure everything is properly committed
    PERFORM pg_sleep(0.1); -- Reduced from 0.5 to make signup faster
    
    -- Process the referral reward with error handling
    BEGIN
      SELECT process_referral_reward(NEW.id, v_referral_code) INTO v_result;
      
      -- Log the result
      RAISE NOTICE 'Referral processing result for user % with code %: %', 
        NEW.id, v_referral_code, v_result;
      
      -- Clear the referral code from profile after processing to prevent reprocessing
      UPDATE profiles 
      SET referral_code = NULL 
      WHERE id = NEW.id;
      
      RAISE NOTICE 'Cleared referral code from profile %', NEW.id;
      
    EXCEPTION WHEN OTHERS THEN
      -- Log error but don't fail the profile creation
      RAISE WARNING 'Error processing referral for user % with code %: % - %', 
        NEW.id, v_referral_code, SQLSTATE, SQLERRM;
    END;
    
  ELSE
    RAISE NOTICE 'No referral code to process for profile %', NEW.id;
  END IF;
  
  RETURN NEW;
  
EXCEPTION WHEN OTHERS THEN
  -- Log any unexpected errors but don't fail
  RAISE WARNING 'Unexpected error in process_referral_from_profile for user %: % - %', 
    NEW.id, SQLSTATE, SQLERRM;
  RETURN NEW;
END;
$$;

-- Add a helper function to manually check referral processing
CREATE OR REPLACE FUNCTION public.debug_referral_status(p_user_id UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_profile RECORD;
  v_referral RECORD;
  v_result JSONB;
BEGIN
  -- Get profile info
  SELECT * INTO v_profile FROM profiles WHERE id = p_user_id;
  
  -- Get referral info
  SELECT * INTO v_referral FROM user_referrals WHERE referred_id = p_user_id;
  
  -- Build debug info
  v_result := jsonb_build_object(
    'user_id', p_user_id,
    'profile_exists', v_profile IS NOT NULL,
    'profile_referral_code', v_profile.referral_code,
    'referral_processed', v_referral IS NOT NULL,
    'referral_info', CASE 
      WHEN v_referral IS NOT NULL THEN
        jsonb_build_object(
          'referrer_id', v_referral.referrer_id,
          'referral_code', v_referral.referral_code,
          'status', v_referral.status,
          'created_at', v_referral.registration_completed_at
        )
      ELSE NULL
    END
  );
  
  RETURN v_result;
END;
$$;

COMMENT ON FUNCTION public.debug_referral_status(UUID) IS 
'Debug function to check the referral processing status for a user';
