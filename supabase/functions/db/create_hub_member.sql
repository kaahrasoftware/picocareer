
-- Function to create a hub member with admin privileges (bypassing RLS)
CREATE OR REPLACE FUNCTION public.create_hub_member(
  hub_id UUID,
  member_profile_id UUID,
  member_role text,
  member_status text
) RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO hub_members (
    hub_id,
    profile_id,
    role,
    status,
    join_date
  ) VALUES (
    hub_id,
    member_profile_id,
    member_role::hub_member_role,
    member_status::status,
    NOW()
  );
END;
$$;
