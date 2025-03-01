
-- Function to confirm hub membership
CREATE OR REPLACE FUNCTION public.confirm_hub_membership(_hub_id uuid)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  v_exists BOOLEAN;
  v_hub_name TEXT;
BEGIN
  -- Check if the user is a member of this hub
  SELECT EXISTS (
    SELECT 1 FROM hub_members
    WHERE hub_id = _hub_id AND profile_id = auth.uid()
  ) INTO v_exists;
  
  IF NOT v_exists THEN
    RETURN jsonb_build_object('success', false, 'message', 'You are not a member of this hub');
  END IF;
  
  -- Get hub name for notification
  SELECT name INTO v_hub_name FROM hubs WHERE id = _hub_id;
  
  -- Update the member record to confirmed
  UPDATE hub_members
  SET confirmed = TRUE,
      updated_at = NOW()
  WHERE hub_id = _hub_id AND profile_id = auth.uid();
  
  -- Update metrics to reflect the new confirmed member
  INSERT INTO hub_member_metrics (
    hub_id, 
    total_members, 
    active_members
  ) VALUES (
    _hub_id, 
    1, 
    1
  )
  ON CONFLICT (hub_id)
  DO UPDATE SET 
    active_members = hub_member_metrics.active_members + 1,
    updated_at = NOW();
  
  -- Update the hub's current member count
  UPDATE hubs 
  SET current_member_count = (
    SELECT COUNT(*) 
    FROM hub_members 
    WHERE hub_id = _hub_id AND confirmed = TRUE
  )
  WHERE id = _hub_id;
  
  -- Log the audit event
  PERFORM log_hub_audit_event(
    _hub_id,
    'member_confirmed',
    jsonb_build_object('member_id', auth.uid())
  );
  
  RETURN jsonb_build_object(
    'success', true, 
    'message', 'Membership confirmed for ' || v_hub_name
  );
END;
$function$;

-- Create RLS policy to allow users to update their own membership
CREATE POLICY "Users can confirm their own membership" ON hub_members
FOR UPDATE 
TO authenticated
USING (profile_id = auth.uid())
WITH CHECK (profile_id = auth.uid());
