
-- Remove old referral system database schema and functions

-- 1. Drop triggers first
DROP TRIGGER IF EXISTS trigger_process_referral_from_profile ON public.profiles;
DROP TRIGGER IF EXISTS ensure_mentor_has_reminder ON public.profiles;

-- 2. Drop old functions
DROP FUNCTION IF EXISTS public.generate_referral_code(uuid);
DROP FUNCTION IF EXISTS public.process_referral_from_profile();
DROP FUNCTION IF EXISTS public.debug_referral_status(uuid);
DROP FUNCTION IF EXISTS public.manual_process_referral(text, text);

-- 3. Remove referral_code column from profiles table
ALTER TABLE public.profiles DROP COLUMN IF EXISTS referral_code;

-- 4. Drop the entire referral_codes table
DROP TABLE IF EXISTS public.referral_codes CASCADE;

-- 5. Recreate the ensure_mentor_has_reminder trigger without referral logic
CREATE OR REPLACE FUNCTION public.ensure_mentor_has_reminder()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  -- When updating user_type to mentor, add default reminder if none exists
  IF (NEW.user_type = 'mentor' AND (OLD.user_type IS NULL OR OLD.user_type != 'mentor')) THEN
    INSERT INTO mentor_reminder_settings (profile_id, minutes_before)
    VALUES (NEW.id, 30)
    ON CONFLICT (profile_id, minutes_before) DO NOTHING;
  END IF;
  
  RETURN NEW;
END;
$$;

-- Recreate the trigger for mentor reminders only
CREATE TRIGGER ensure_mentor_has_reminder
  AFTER UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.ensure_mentor_has_reminder();

-- 6. Update handle_new_user function to remove referral code logic
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER 
SET search_path = ''
AS $$
BEGIN
  -- Log the start of user creation
  RAISE NOTICE 'Creating new user profile for user ID: %', NEW.id;
  
  -- Insert new profile with basic data only
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
