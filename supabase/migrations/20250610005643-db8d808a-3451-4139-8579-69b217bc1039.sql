
-- Add avatar_type column to profiles table
ALTER TABLE public.profiles 
ADD COLUMN avatar_type TEXT DEFAULT 'default' CHECK (avatar_type IN ('default', 'uploaded'));

-- Update existing profiles without avatars to use default avatars
UPDATE public.profiles 
SET avatar_type = 'default' 
WHERE avatar_url IS NULL OR avatar_url = '';

-- Update existing profiles with avatars to be marked as uploaded
UPDATE public.profiles 
SET avatar_type = 'uploaded' 
WHERE avatar_url IS NOT NULL AND avatar_url != '' AND avatar_type IS NULL;
