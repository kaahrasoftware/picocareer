
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
  v_end_time TIMESTAMPTZ;
  v_slot_data RECORD;
  v_booking_start_time TIME;
  v_booking_end_time TIME;
BEGIN
  -- Get the session duration
  SELECT duration INTO v_session_duration
  FROM mentor_session_types
  WHERE id = p_session_type_id;

  IF v_session_duration IS NULL THEN
    RAISE EXCEPTION 'Invalid session type';
  END IF;

  -- Calculate end time based on session duration
  v_end_time := p_scheduled_at + (v_session_duration || ' minutes')::interval;
  
  -- Extract times for comparison
  v_booking_start_time := p_scheduled_at::TIME;
  v_booking_end_time := v_end_time::TIME;

  -- Log input parameters for debugging
  RAISE NOTICE 'Booking parameters: mentor_id=%, scheduled_at=%, start_time=%, session_date=%', 
    p_mentor_id, p_scheduled_at, p_start_time, p_session_date;

  -- Check for existing overlapping sessions
  IF EXISTS (
    SELECT 1 FROM mentor_sessions ms
    JOIN mentor_session_types mst ON ms.session_type_id = mst.id
    WHERE ms.mentor_id = p_mentor_id
    AND ms.status = 'scheduled'
    AND (
      (ms.scheduled_at BETWEEN p_scheduled_at AND v_end_time)
      OR
      (ms.scheduled_at + (mst.duration || ' minutes')::interval BETWEEN p_scheduled_at AND v_end_time)
      OR
      (p_scheduled_at BETWEEN ms.scheduled_at AND ms.scheduled_at + (mst.duration || ' minutes')::interval)
    )
  ) THEN
    RAISE EXCEPTION 'Time slot is already booked';
  END IF;

  -- Find matching availability slot with improved logging
  BEGIN
    SELECT id, start_date_time, end_date_time, recurring, day_of_week, timezone_offset 
    INTO v_slot_data
    FROM mentor_availability
    WHERE profile_id = p_mentor_id
      AND is_available = true
      AND booked_session_id IS NULL
      AND (
        -- Check for one-time availability
        (
          recurring = false 
          AND DATE(start_date_time) = DATE(p_scheduled_at)
          AND start_date_time <= p_scheduled_at
          AND end_date_time >= v_end_time
        )
        OR
        -- Check for recurring availability with better time handling
        (
          recurring = true 
          AND day_of_week = EXTRACT(DOW FROM p_scheduled_at)
          AND (start_date_time::TIME <= v_booking_start_time)
          AND (end_date_time::TIME >= v_booking_end_time)
        )
      )
    ORDER BY 
      recurring ASC, -- Prefer non-recurring slots first
      ABS(EXTRACT(EPOCH FROM (start_date_time - p_scheduled_at))) ASC -- Then closest start time
    LIMIT 1;

    -- Log the found slot for debugging
    IF v_slot_data IS NOT NULL THEN
      RAISE NOTICE 'Found availability slot: id=%, recurring=%, start=%, end=%', 
        v_slot_data.id, v_slot_data.recurring, v_slot_data.start_date_time, v_slot_data.end_date_time;
    ELSE
      -- Check what slots are available for better error messages
      DECLARE
        v_available_slots TEXT;
      BEGIN
        SELECT string_agg(id || ': ' || start_date_time || ' to ' || end_date_time || ' (recurring: ' || recurring || ')', E'\n')
        INTO v_available_slots
        FROM mentor_availability
        WHERE profile_id = p_mentor_id
          AND is_available = true
          AND booked_session_id IS NULL
          AND (
            (recurring = false AND DATE(start_date_time) = DATE(p_scheduled_at))
            OR
            (recurring = true AND day_of_week = EXTRACT(DOW FROM p_scheduled_at))
          );
          
        RAISE NOTICE 'Available slots for the day: %', COALESCE(v_available_slots, 'None');
        RAISE EXCEPTION 'No available slot found for the selected time. Requested: %, day %', 
          p_scheduled_at, 
          EXTRACT(DOW FROM p_scheduled_at);
      END;
    END IF;
  EXCEPTION
    WHEN NO_DATA_FOUND THEN
      RAISE EXCEPTION 'No availability slot found for mentor at the requested time';
  END;

  v_availability_id := v_slot_data.id;

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
      mentee_telegram_username,
      status
    ) VALUES (
      p_mentor_id,
      p_mentee_id,
      p_session_type_id,
      p_scheduled_at,
      p_notes,
      p_meeting_platform::meeting_platform,
      p_mentee_phone_number,
      p_mentee_telegram_username,
      'scheduled'
    )
    RETURNING id INTO v_session_id;

    -- Handle recurring availability differently
    IF v_slot_data.recurring THEN
      -- For recurring slots, create a new one-time slot that's marked as booked
      INSERT INTO mentor_availability (
        profile_id,
        start_date_time,
        end_date_time,
        is_available,
        recurring,
        day_of_week,
        booked_session_id,
        timezone_offset
      ) VALUES (
        p_mentor_id,
        p_scheduled_at,
        v_end_time,
        false,
        false,
        v_slot_data.day_of_week,
        v_session_id,
        v_slot_data.timezone_offset
      );
    ELSE
      -- For one-time slots, handle splitting if needed
      -- Create pre-session slot if there's time before
      IF p_scheduled_at > v_slot_data.start_date_time THEN
        INSERT INTO mentor_availability (
          profile_id,
          start_date_time,
          end_date_time,
          is_available,
          recurring,
          timezone_offset
        ) VALUES (
          p_mentor_id,
          v_slot_data.start_date_time,
          p_scheduled_at,
          true,
          false,
          v_slot_data.timezone_offset
        );
      END IF;

      -- Create post-session slot if there's time after
      IF v_end_time < v_slot_data.end_date_time THEN
        INSERT INTO mentor_availability (
          profile_id,
          start_date_time,
          end_date_time,
          is_available,
          recurring,
          timezone_offset
        ) VALUES (
          p_mentor_id,
          v_end_time,
          v_slot_data.end_date_time,
          true,
          false,
          v_slot_data.timezone_offset
        );
      END IF;

      -- Create the booked slot
      INSERT INTO mentor_availability (
        profile_id,
        start_date_time,
        end_date_time,
        is_available,
        recurring,
        booked_session_id,
        timezone_offset
      ) VALUES (
        p_mentor_id,
        p_scheduled_at,
        v_end_time,
        false,
        false,
        v_session_id,
        v_slot_data.timezone_offset
      );

      -- Delete the original slot
      DELETE FROM mentor_availability WHERE id = v_availability_id;
    END IF;

    -- Return the session ID and availability ID
    RETURN jsonb_build_object(
      'session_id', v_session_id,
      'availability_id', v_availability_id
    );
  EXCEPTION
    WHEN OTHERS THEN
      -- Log error details
      RAISE NOTICE 'Error in create_session_and_update_availability: %', SQLERRM;
      -- Re-raise the error
      RAISE;
  END;
END;
$$;
