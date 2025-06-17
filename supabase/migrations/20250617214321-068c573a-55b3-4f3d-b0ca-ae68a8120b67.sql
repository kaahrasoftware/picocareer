

-- First, let's see what duplicates exist
SELECT 
  profile_id,
  start_date_time,
  end_date_time,
  recurring,
  day_of_week,
  COUNT(*) as duplicate_count,
  array_agg(id) as slot_ids,
  array_agg(booked_session_id) as session_ids,
  array_agg(created_at) as created_dates
FROM mentor_availability 
GROUP BY profile_id, start_date_time, end_date_time, recurring, day_of_week
HAVING COUNT(*) > 1
ORDER BY duplicate_count DESC
LIMIT 10;

-- More aggressive cleanup - remove ALL duplicates except the most recent one per group
WITH ranked_slots AS (
  SELECT 
    id,
    profile_id,
    start_date_time,
    end_date_time,
    recurring,
    day_of_week,
    booked_session_id,
    is_available,
    created_at,
    ROW_NUMBER() OVER (
      PARTITION BY profile_id, start_date_time, end_date_time, COALESCE(recurring, false), COALESCE(day_of_week, -1)
      ORDER BY 
        CASE WHEN booked_session_id IS NOT NULL THEN 0 ELSE 1 END, -- Prioritize booked slots
        created_at DESC, -- Then most recent
        id DESC -- Finally by ID for consistency
    ) as rn
  FROM mentor_availability
),
slots_to_delete AS (
  SELECT id FROM ranked_slots WHERE rn > 1
)
DELETE FROM mentor_availability 
WHERE id IN (SELECT id FROM slots_to_delete);

-- Now create the utility functions
CREATE OR REPLACE FUNCTION cleanup_duplicate_availability_slots()
RETURNS TABLE(
  cleaned_count INTEGER,
  mentor_id UUID,
  mentor_email TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_deleted_count INTEGER := 0;
  r RECORD;
BEGIN
  FOR r IN (
    SELECT DISTINCT ma.profile_id, COALESCE(p.email, 'unknown') as email
    FROM mentor_availability ma
    LEFT JOIN profiles p ON ma.profile_id = p.id
    WHERE ma.profile_id IN (
      SELECT profile_id
      FROM mentor_availability
      GROUP BY profile_id, start_date_time, end_date_time, COALESCE(recurring, false), COALESCE(day_of_week, -1)
      HAVING COUNT(*) > 1
    )
  )
  LOOP
    WITH ranked_slots AS (
      SELECT 
        id,
        ROW_NUMBER() OVER (
          PARTITION BY profile_id, start_date_time, end_date_time, COALESCE(recurring, false), COALESCE(day_of_week, -1)
          ORDER BY 
            CASE WHEN booked_session_id IS NOT NULL THEN 0 ELSE 1 END,
            created_at DESC,
            id DESC
        ) as rn
      FROM mentor_availability
      WHERE profile_id = r.profile_id
    ),
    deleted_slots AS (
      DELETE FROM mentor_availability 
      WHERE id IN (SELECT id FROM ranked_slots WHERE rn > 1)
      RETURNING id
    )
    SELECT COUNT(*) INTO v_deleted_count FROM deleted_slots;
    
    IF v_deleted_count > 0 THEN
      cleaned_count := v_deleted_count;
      mentor_id := r.profile_id;
      mentor_email := r.email;
      RETURN NEXT;
    END IF;
  END LOOP;
END;
$$;

-- Create the prevention trigger
CREATE OR REPLACE FUNCTION prevent_duplicate_availability()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  -- Check for existing non-recurring slot
  IF COALESCE(NEW.recurring, false) = false THEN
    IF EXISTS (
      SELECT 1 FROM mentor_availability
      WHERE profile_id = NEW.profile_id
        AND start_date_time = NEW.start_date_time
        AND end_date_time = NEW.end_date_time
        AND COALESCE(recurring, false) = false
        AND id != COALESCE(NEW.id, '00000000-0000-0000-0000-000000000000'::uuid)
        AND booked_session_id IS NULL
        AND NEW.booked_session_id IS NULL
    ) THEN
      RAISE EXCEPTION 'Duplicate non-recurring availability slot already exists for this time period';
    END IF;
  END IF;
  
  -- Check for existing recurring slot
  IF COALESCE(NEW.recurring, false) = true THEN
    IF EXISTS (
      SELECT 1 FROM mentor_availability
      WHERE profile_id = NEW.profile_id
        AND day_of_week = NEW.day_of_week
        AND EXTRACT(hour FROM start_date_time) = EXTRACT(hour FROM NEW.start_date_time)
        AND EXTRACT(minute FROM start_date_time) = EXTRACT(minute FROM NEW.start_date_time)
        AND EXTRACT(hour FROM end_date_time) = EXTRACT(hour FROM NEW.end_date_time)
        AND EXTRACT(minute FROM end_date_time) = EXTRACT(minute FROM NEW.end_date_time)
        AND COALESCE(recurring, false) = true
        AND id != COALESCE(NEW.id, '00000000-0000-0000-0000-000000000000'::uuid)
        AND booked_session_id IS NULL
        AND NEW.booked_session_id IS NULL
    ) THEN
      RAISE EXCEPTION 'Duplicate recurring availability slot already exists for this time period';
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$;

-- Create the trigger
DROP TRIGGER IF EXISTS prevent_duplicate_availability_trigger ON mentor_availability;
CREATE TRIGGER prevent_duplicate_availability_trigger
  BEFORE INSERT OR UPDATE ON mentor_availability
  FOR EACH ROW EXECUTE FUNCTION prevent_duplicate_availability();

-- Create monitoring function
CREATE OR REPLACE FUNCTION monitor_availability_duplicates()
RETURNS TABLE(
  profile_id UUID,
  mentor_email TEXT,
  duplicate_count BIGINT,
  sample_start_time TIMESTAMP WITH TIME ZONE,
  sample_end_time TIMESTAMP WITH TIME ZONE
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    ma.profile_id,
    COALESCE(p.email, 'unknown') as mentor_email,
    COUNT(*) as duplicate_count,
    MIN(ma.start_date_time) as sample_start_time,
    MIN(ma.end_date_time) as sample_end_time
  FROM mentor_availability ma
  LEFT JOIN profiles p ON ma.profile_id = p.id
  GROUP BY ma.profile_id, p.email, ma.start_date_time, ma.end_date_time, COALESCE(ma.recurring, false), COALESCE(ma.day_of_week, -1)
  HAVING COUNT(*) > 1
  ORDER BY duplicate_count DESC;
END;
$$;

