
CREATE OR REPLACE FUNCTION create_session_and_update_availability(
  p_mentor_id UUID,
  p_mentee_id UUID,
  p_session_type_id UUID,
  p_scheduled_at TIMESTAMPTZ,
  p_notes TEXT,
  p_meeting_platform TEXT,
  p_mentee_phone_number TEXT,
  p_mentee_telegram_username TEXT,
  p_start_time TEXT,
  p_session_date TEXT
) RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_session_id UUID;
  v_availability_id UUID;
  v_session_duration INT;
BEGIN
  -- Get the session duration
  SELECT duration INTO v_session_duration
  FROM mentor_session_types
  WHERE id = p_session_type_id;

  -- Find the matching availability slot
  SELECT id INTO v_availability_id
  FROM mentor_availability
  WHERE profile_id = p_mentor_id
    AND is_available = true
    AND booked_session_id IS NULL
    AND (
      (recurring = true AND EXTRACT(DOW FROM p_scheduled_at) = day_of_week)
      OR
      (recurring = false AND DATE(start_date_time) = DATE(p_scheduled_at))
    )
    AND to_char(start_date_time, 'HH24:MI') <= p_start_time
    AND to_char(end_date_time, 'HH24:MI') >= p_start_time;

  IF v_availability_id IS NULL THEN
    RAISE EXCEPTION 'No available slot found for the selected time';
  END IF;

  -- Start transaction
  BEGIN
    -- Create the session
    INSERT INTO mentor_sessions (
      mentor_id,
      mentee_id,
      session_type_id,
      scheduled_at,
      notes,
      meeting_platform,
      mentee_phone_number,
      mentee_telegram_username
    ) VALUES (
      p_mentor_id,
      p_mentee_id,
      p_session_type_id,
      p_scheduled_at,
      p_notes,
      p_meeting_platform::meeting_platform,
      p_mentee_phone_number,
      p_mentee_telegram_username
    )
    RETURNING id INTO v_session_id;

    -- Update the availability slot
    UPDATE mentor_availability
    SET booked_session_id = v_session_id
    WHERE id = v_availability_id;

    -- Return the session ID
    RETURN jsonb_build_object(
      'session_id', v_session_id,
      'availability_id', v_availability_id
    );
  EXCEPTION
    WHEN OTHERS THEN
      RAISE;
  END;
END;
$$;
