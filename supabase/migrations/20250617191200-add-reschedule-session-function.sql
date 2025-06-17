
-- Create the reschedule_session function for managing session rescheduling
CREATE OR REPLACE FUNCTION reschedule_session(
  p_session_id UUID,
  p_new_time TIMESTAMP WITH TIME ZONE
) RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_session RECORD;
  v_old_availability_id UUID;
  v_new_availability_id UUID;
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
    -- Find the current availability slot that's booked with this session
    SELECT id INTO v_old_availability_id
    FROM mentor_availability
    WHERE booked_session_id = p_session_id;

    -- Release the old availability slot
    IF v_old_availability_id IS NOT NULL THEN
      UPDATE mentor_availability
      SET is_available = true,
          booked_session_id = NULL
      WHERE id = v_old_availability_id;
    END IF;

    -- Find a suitable new availability slot for the new time
    -- Look for an available slot that matches the new time
    SELECT id INTO v_new_availability_id
    FROM mentor_availability
    WHERE profile_id = v_session.mentor_id
      AND is_available = true
      AND start_date_time <= p_new_time
      AND end_date_time >= p_new_time + INTERVAL '1 hour' -- Assuming 1 hour session duration
    ORDER BY start_date_time
    LIMIT 1;

    -- If we found a suitable slot, book it
    IF v_new_availability_id IS NOT NULL THEN
      UPDATE mentor_availability
      SET is_available = false,
          booked_session_id = p_session_id
      WHERE id = v_new_availability_id;
    END IF;

    -- Update the session with the new time
    UPDATE mentor_sessions
    SET scheduled_at = p_new_time,
        availability_slot_id = v_new_availability_id,
        updated_at = NOW()
    WHERE id = p_session_id;

    -- Return success
    RETURN jsonb_build_object(
      'success', true,
      'session_id', p_session_id,
      'new_time', p_new_time,
      'old_availability_released', v_old_availability_id IS NOT NULL,
      'new_availability_booked', v_new_availability_id IS NOT NULL
    );
  EXCEPTION
    WHEN OTHERS THEN
      -- Log error details
      RAISE NOTICE 'Error in reschedule_session: %', SQLERRM;
      -- Re-raise the error
      RAISE;
  END;
END;
$$;
