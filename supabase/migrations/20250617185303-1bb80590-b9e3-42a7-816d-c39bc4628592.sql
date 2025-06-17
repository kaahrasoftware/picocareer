
-- Drop and recreate the handle_new_user function with proper type handling
DROP FUNCTION IF EXISTS public.handle_new_user() CASCADE;

-- Create a completely new handle_new_user function with robust error handling
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER 
SET search_path = 'public'
AS $$
DECLARE
  v_referral_code TEXT;
  v_user_type TEXT;
  v_user_type_enum public.user_type;
BEGIN
  -- Log the start of user creation
  RAISE NOTICE 'Creating new user profile for user ID: %', NEW.id;
  
  -- Extract referral code from user metadata
  v_referral_code := NEW.raw_user_meta_data->>'referral_code';
  
  -- Extract and validate user_type with explicit casting
  v_user_type := COALESCE(NEW.raw_user_meta_data->>'user_type', 'mentee');
  
  -- Validate and cast user_type to enum
  CASE v_user_type
    WHEN 'admin' THEN v_user_type_enum := 'admin'::public.user_type;
    WHEN 'mentor' THEN v_user_type_enum := 'mentor'::public.user_type;
    WHEN 'mentee' THEN v_user_type_enum := 'mentee'::public.user_type;
    WHEN 'editor' THEN v_user_type_enum := 'editor'::public.user_type;
    ELSE v_user_type_enum := 'mentee'::public.user_type;
  END CASE;
  
  RAISE NOTICE 'User type set to: %', v_user_type_enum;
  
  -- Insert new profile with explicit enum casting
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
    v_user_type_enum
  );
  
  RAISE NOTICE 'Profile created successfully for user %', NEW.id;
  
  -- Process referral if we have a referral code
  IF v_referral_code IS NOT NULL AND v_referral_code != '' THEN
    -- Add a small delay to ensure profile is committed
    PERFORM pg_sleep(0.1);
    
    RAISE NOTICE 'Processing referral with code: %', v_referral_code;
    
    -- Process the referral reward
    PERFORM public.process_referral_reward(NEW.id, v_referral_code);
    
    RAISE NOTICE 'Processed referral for new user % with code %', NEW.id, v_referral_code;
  END IF;
  
  -- Log successful profile creation
  RAISE NOTICE 'Successfully completed user creation for %', NEW.id;
  
  RETURN NEW;
  
EXCEPTION WHEN OTHERS THEN
  -- Log detailed error information
  RAISE WARNING 'Error in handle_new_user for user %: SQLSTATE=%, SQLERRM=%', NEW.id, SQLSTATE, SQLERRM;
  
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
    
    RAISE NOTICE 'Created fallback profile for user %', NEW.id;
    
  EXCEPTION WHEN OTHERS THEN
    RAISE WARNING 'Critical error: Could not create fallback profile for user %: SQLSTATE=%, SQLERRM=%', NEW.id, SQLSTATE, SQLERRM;
  END;
  
  RETURN NEW;
END;
$$;

-- Recreate the trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Verify the function was created successfully
SELECT 
  p.proname as function_name,
  p.prosrc as function_body
FROM pg_proc p
JOIN pg_namespace n ON p.pronamespace = n.oid
WHERE n.nspname = 'public' AND p.proname = 'handle_new_user';
