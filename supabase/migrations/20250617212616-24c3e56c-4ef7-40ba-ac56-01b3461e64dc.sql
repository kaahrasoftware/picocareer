
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
  v_session_duration INT;
  v_new_end_time TIMESTAMP WITH TIME ZONE;
  v_availability_id UUID;
  v_slot_data RECORD;
  v_booking_start_time TIME;
  v_booking_end_time TIME;
  v_old_slot_id UUID;
BEGIN
  -- Get the session details
  SELECT * INTO v_session
  FROM mentor_sessions
  WHERE id = p_session_id;

  IF v_session IS NULL THEN
    RAISE EXCEPTION 'Session not found';
  END IF;

  -- Get the session duration
  SELECT duration INTO v_session_duration
  FROM mentor_session_types
  WHERE id = v_session.session_type_id;

  IF v_session_duration IS NULL THEN
    RAISE EXCEPTION 'Invalid session type';
  END IF;

  -- Calculate end time based on session duration
  v_new_end_time := p_new_time + (v_session_duration || ' minutes')::interval;
  
  -- Extract times for comparison
  v_booking_start_time := p_new_time::TIME;
  v_booking_end_time := v_new_end_time::TIME;

  -- Check for existing overlapping sessions
  IF EXISTS (
    SELECT 1 FROM mentor_sessions ms
    JOIN mentor_session_types mst ON ms.session_type_id = mst.id
    WHERE ms.mentor_id = v_session.mentor_id
    AND ms.id != p_session_id
    AND ms.status = 'scheduled'
    AND (
      (ms.scheduled_at BETWEEN p_new_time AND v_new_end_time)
      OR
      (ms.scheduled_at + (mst.duration || ' minutes')::interval BETWEEN p_new_time AND v_new_end_time)
      OR
      (p_new_time BETWEEN ms.scheduled_at AND ms.scheduled_at + (mst.duration || ' minutes')::interval)
    )
  ) THEN
    RAISE EXCEPTION 'Time slot is already booked by another session';
  END IF;

  -- Find matching availability slot
  SELECT id, start_date_time, end_date_time, recurring, day_of_week, timezone_offset, reference_timezone, dst_aware
  INTO v_slot_data
  FROM mentor_availability
  WHERE profile_id = v_session.mentor_id
    AND is_available = true
    AND booked_session_id IS NULL
    AND (
      -- Check for one-time availability
      (
        recurring = false 
        AND DATE(start_date_time) = DATE(p_new_time)
        AND start_date_time <= p_new_time
        AND end_date_time >= v_new_end_time
      )
      OR
      -- Check for recurring availability
      (
        recurring = true 
        AND day_of_week = EXTRACT(DOW FROM p_new_time)
        AND (start_date_time::TIME <= v_booking_start_time)
        AND (end_date_time::TIME >= v_booking_end_time)
      )
    )
  ORDER BY 
    recurring ASC, -- Prefer non-recurring slots first
    ABS(EXTRACT(EPOCH FROM (start_date_time - p_new_time))) ASC -- Then closest start time
  LIMIT 1;

  IF v_slot_data IS NULL THEN
    RAISE EXCEPTION 'No available slot found for the selected time. Requested: %', p_new_time;
  END IF;

  v_availability_id := v_slot_data.id;

  -- Start transaction
  BEGIN
    -- Get the old availability slot that's currently booked with this session
    SELECT id INTO v_old_slot_id
    FROM mentor_availability 
    WHERE booked_session_id = p_session_id;

    -- Release the old availability slot by marking it as available
    IF v_old_slot_id IS NOT NULL THEN
      UPDATE mentor_availability
      SET is_available = true, 
          booked_session_id = NULL
      WHERE id = v_old_slot_id;
    END IF;

    -- Simply mark the new slot as booked - no slot creation or splitting
    UPDATE mentor_availability
    SET is_available = false,
        booked_session_id = p_session_id
    WHERE id = v_availability_id;

    -- Update the session with the new scheduled time
    UPDATE mentor_sessions
    SET scheduled_at = p_new_time
    WHERE id = p_session_id;

    -- Return success
    RETURN jsonb_build_object(
      'success', true,
      'session_id', p_session_id,
      'new_time', p_new_time,
      'old_slot_released', v_old_slot_id IS NOT NULL,
      'new_slot_booked', v_availability_id
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
