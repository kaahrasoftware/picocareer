-- Phase 1: Database Updates for Resource Bank Admin Upload

-- Allow NULL event_id for general resources not tied to specific events
ALTER TABLE public.event_resources 
ALTER COLUMN event_id DROP NOT NULL;

-- Add comment to clarify the purpose
COMMENT ON COLUMN public.event_resources.event_id IS 'Event ID - can be NULL for general resources in the resource bank';

-- Update RLS policies to allow admins to create and manage all resources
CREATE POLICY "Admins can manage all event resources" 
ON public.event_resources 
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.id = auth.uid() 
    AND profiles.user_type = 'admin'
  )
);

-- Allow admins to create general resources (without event association)
CREATE POLICY "Admins can create general resources"
ON public.event_resources
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.id = auth.uid() 
    AND profiles.user_type = 'admin'
  )
  AND (event_id IS NULL OR event_id IS NOT NULL)
);