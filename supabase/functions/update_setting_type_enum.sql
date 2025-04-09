
-- SQL function to update the setting_type enum type
-- This is needed to ensure session_settings is an allowed value
DO $$
BEGIN
    -- Check if 'session_settings' already exists in the enum
    IF NOT EXISTS (
        SELECT 1
        FROM pg_type t
        JOIN pg_enum e ON t.oid = e.enumtypid
        WHERE t.typname = 'setting_type'
        AND e.enumlabel = 'session_settings'
    ) THEN
        -- Add 'session_settings' to the setting_type enum
        ALTER TYPE setting_type ADD VALUE IF NOT EXISTS 'session_settings';
    END IF;
END $$;
