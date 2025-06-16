
-- Fix the referral trigger timing to prevent conflicts during profile creation
-- The issue is that the trigger is firing BEFORE insert, which conflicts with other triggers

-- First, drop the existing trigger that's causing conflicts
DROP TRIGGER IF EXISTS trigger_process_referral_from_profile ON public.profiles;

-- Recreate the trigger to fire AFTER INSERT only (not UPDATE)
-- This ensures the profile is fully committed before referral processing
CREATE TRIGGER trigger_process_referral_from_profile
  AFTER INSERT ON public.profiles
  FOR EACH ROW
  WHEN (NEW.referral_code IS NOT NULL AND NEW.referral_code != '')
  EXECUTE FUNCTION public.process_referral_from_profile();

-- Add some logging to help debug if issues persist
COMMENT ON TRIGGER trigger_process_referral_from_profile ON public.profiles IS 
'Processes referral rewards after profile creation. Fires AFTER INSERT to avoid conflicts with other triggers.';
