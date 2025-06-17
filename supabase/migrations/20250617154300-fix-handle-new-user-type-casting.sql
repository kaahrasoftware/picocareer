
-- Fix the handle_new_user function to properly cast user_type to enum
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER 
SET search_path = ''
AS $$
DECLARE
  v_referral_code TEXT;
  v_user_type TEXT;
BEGIN
  -- Log the start of user creation
  RAISE NOTICE 'Creating new user profile for user ID: %', NEW.id;
  
  -- Extract referral code from user metadata
  v_referral_code := NEW.raw_user_meta_data->>'referral_code';
  
  -- Extract and validate user_type
  v_user_type := COALESCE(NEW.raw_user_meta_data->>'user_type', 'mentee');
  
  -- Ensure user_type is valid, default to 'mentee' if invalid
  IF v_user_type NOT IN ('admin', 'mentor', 'mentee') THEN
    v_user_type := 'mentee';
  END IF;
  
  -- Insert new profile with proper casting
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
    v_user_type::public.user_type
  );
  
  -- Process referral if we have a referral code
  IF v_referral_code IS NOT NULL AND v_referral_code != '' THEN
    -- Add a small delay to ensure profile is committed
    PERFORM pg_sleep(0.5);
    
    -- Process the referral reward
    PERFORM process_referral_reward(NEW.id, v_referral_code::CHARACTER VARYING(20));
    
    RAISE NOTICE 'Processed referral for new user % with code %', NEW.id, v_referral_code;
  END IF;
  
  -- Log successful profile creation
  RAISE NOTICE 'Successfully created profile for user %', NEW.id;
  
  RETURN NEW;
  
EXCEPTION WHEN OTHERS THEN
  -- Log any errors but don't fail the user creation
  RAISE WARNING 'Error in handle_new_user for user %: % - %', NEW.id, SQLSTATE, SQLERRM;
  
  -- Try to create a basic profile to prevent signup failure
  BEGIN
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
      'mentee'::public.user_type
    )
    ON CONFLICT (id) DO NOTHING;
  EXCEPTION WHEN OTHERS THEN
    RAISE WARNING 'Critical error: Could not create profile for user %: %', NEW.id, SQLERRM;
  END;
  
  RETURN NEW;
END;
$$;

-- Ensure the trigger exists
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
