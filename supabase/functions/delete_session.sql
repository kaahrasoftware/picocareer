
CREATE OR REPLACE FUNCTION delete_session(
  p_session_id UUID
) RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_session RECORD;
BEGIN
  -- Get the session details first for notifications
  SELECT 
    ms.id,
    ms.mentor_id,
    ms.mentee_id,
    pm.full_name AS mentor_name,
    pme.full_name AS mentee_name
  INTO v_session
  FROM mentor_sessions ms
  JOIN profiles pm ON ms.mentor_id = pm.id
  JOIN profiles pme ON ms.mentee_id = pme.id
  WHERE ms.id = p_session_id;
  
  IF v_session IS NULL THEN
    RETURN jsonb_build_object(
      'success', false,
      'message', 'Session not found'
    );
  END IF;
  
  -- Begin transaction
  BEGIN
    -- First delete any session feedback associated with this session
    DELETE FROM session_feedback
    WHERE session_id = p_session_id;
    
    -- Next update all availability records that reference this session
    UPDATE mentor_availability
    SET is_available = true, 
        booked_session_id = NULL
    WHERE booked_session_id = p_session_id;
    
    -- Now delete the session
    DELETE FROM mentor_sessions
    WHERE id = p_session_id;
    
    -- Create notifications for both parties
    INSERT INTO notifications (
      profile_id,
      title,
      message,
      type,
      action_url,
      category
    )
    SELECT 
      unnest(ARRAY[v_session.mentor_id, v_session.mentee_id]),
      'Session Deleted',
      CASE WHEN profile_id = v_session.mentor_id 
           THEN 'Your session with ' || v_session.mentee_name || ' has been deleted by an administrator.'
           ELSE 'Your session with ' || v_session.mentor_name || ' has been deleted by an administrator.'
      END,
      'session_update',
      '/profile?tab=calendar',
      'general'
    FROM profiles
    WHERE id IN (v_session.mentor_id, v_session.mentee_id);
    
    RETURN jsonb_build_object(
      'success', true,
      'message', 'Session deleted successfully',
      'session_id', p_session_id
    );
    
    EXCEPTION WHEN OTHERS THEN
      RAISE LOG 'Error in delete_session: %', SQLERRM;
      RETURN jsonb_build_object(
        'success', false,
        'message', 'Failed to delete session: ' || SQLERRM
      );
  END;
END;
$$;
