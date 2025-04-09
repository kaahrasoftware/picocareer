
CREATE OR REPLACE FUNCTION cancel_session(
  p_session_id UUID,
  p_reason TEXT DEFAULT 'Cancelled by user'
) RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_session RECORD;
  v_availability_id UUID;
BEGIN
  -- Get the session details
  SELECT * INTO v_session
  FROM mentor_sessions
  WHERE id = p_session_id;

  IF v_session IS NULL THEN
    RAISE EXCEPTION 'Session not found';
  END IF;

  -- Start transaction
  BEGIN
    -- Find the existing availability slot that's booked with this session
    SELECT id INTO v_availability_id
    FROM mentor_availability
    WHERE booked_session_id = p_session_id;

    -- If found, update it to be available again
    IF v_availability_id IS NOT NULL THEN
      UPDATE mentor_availability
      SET is_available = true,
          booked_session_id = NULL
      WHERE id = v_availability_id;
    END IF;

    -- Update the session status to cancelled
    UPDATE mentor_sessions
    SET status = 'cancelled',
        notes = CASE 
          WHEN notes IS NULL OR notes = '' THEN p_reason
          ELSE notes || E'\n\nCancellation reason: ' || p_reason
        END
    WHERE id = p_session_id;

    -- Return success
    RETURN jsonb_build_object(
      'success', true,
      'session_id', p_session_id,
      'reason', p_reason
    );
  EXCEPTION
    WHEN OTHERS THEN
      -- Log error details
      RAISE NOTICE 'Error in cancel_session: %', SQLERRM;
      -- Re-raise the error
      RAISE;
  END;
END;
$$;
