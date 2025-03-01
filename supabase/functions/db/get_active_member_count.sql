
-- Function to count the number of active members in a hub
CREATE OR REPLACE FUNCTION public.get_active_member_count(hub_id UUID)
RETURNS integer
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COUNT(*)::integer
  FROM hub_members
  WHERE hub_id = $1
  AND status = 'Approved'
$$;
