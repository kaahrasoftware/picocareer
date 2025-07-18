
-- Add is_favorite field to mentee_courses table to track favorite subjects
ALTER TABLE mentee_courses 
ADD COLUMN is_favorite boolean DEFAULT false;

-- Add some missing academic fields to profiles table if they don't exist
DO $$ 
BEGIN
    -- Check and add current_gpa if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'profiles' AND column_name = 'current_gpa'
    ) THEN
        ALTER TABLE profiles ADD COLUMN current_gpa numeric(3,2);
    END IF;
    
    -- Check and add graduation_year if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'profiles' AND column_name = 'graduation_year'
    ) THEN
        ALTER TABLE profiles ADD COLUMN graduation_year integer;
    END IF;
    
    -- Check and add total_credits if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'profiles' AND column_name = 'total_credits'
    ) THEN
        ALTER TABLE profiles ADD COLUMN total_credits integer;
    END IF;
    
    -- Check and add class_rank if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'profiles' AND column_name = 'class_rank'
    ) THEN
        ALTER TABLE profiles ADD COLUMN class_rank text;
    END IF;
    
    -- Check and add academic_status if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'profiles' AND column_name = 'academic_status'
    ) THEN
        ALTER TABLE profiles ADD COLUMN academic_status text;
    END IF;
END $$;
