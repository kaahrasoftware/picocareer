
-- Create a function to process referrals from user metadata
CREATE OR REPLACE FUNCTION public.process_referral_from_metadata()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $function$
DECLARE
  v_referral_code TEXT;
  v_user_metadata JSONB;
BEGIN
  -- Get user metadata to check for referral code
  SELECT raw_user_meta_data INTO v_user_metadata
  FROM auth.users
  WHERE id = NEW.id;
  
  -- Extract referral code from metadata
  v_referral_code := v_user_metadata->>'referral_code';
  
  -- If we have a referral code, process it
  IF v_referral_code IS NOT NULL AND v_referral_code != '' THEN
    -- Wait a moment to ensure the profile is fully created
    PERFORM pg_sleep(1);
    
    -- Process the referral reward
    PERFORM process_referral_reward(NEW.id, v_referral_code);
    
    RAISE NOTICE 'Processed referral reward for profile % with code %', NEW.id, v_referral_code;
  END IF;
  
  RETURN NEW;
END;
$function$;

-- Create trigger to automatically process referrals when a profile is created
DROP TRIGGER IF EXISTS trigger_process_referral_from_metadata ON public.profiles;
CREATE TRIGGER trigger_process_referral_from_metadata
  AFTER INSERT ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.process_referral_from_metadata();
