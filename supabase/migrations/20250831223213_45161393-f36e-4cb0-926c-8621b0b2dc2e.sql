-- CRITICAL SECURITY FIX: Enable RLS on student data tables
-- This fixes vulnerabilities where sensitive student data was publicly accessible

-- Enable RLS on mentee_interests table
ALTER TABLE public.mentee_interests ENABLE ROW LEVEL SECURITY;

-- Enable RLS on mentee_academic_records table  
ALTER TABLE public.mentee_academic_records ENABLE ROW LEVEL SECURITY;

-- Enable RLS on mentee_courses table
ALTER TABLE public.mentee_courses ENABLE ROW LEVEL SECURITY;

-- Enable RLS on mentee_projects table
ALTER TABLE public.mentee_projects ENABLE ROW LEVEL SECURITY;

-- Enable RLS on mentee_essay_responses table
ALTER TABLE public.mentee_essay_responses ENABLE ROW LEVEL SECURITY;

-- Enable RLS on referral_codes table
ALTER TABLE public.referral_codes ENABLE ROW LEVEL SECURITY;

-- Add admin access policies for all student data tables (for legitimate administrative needs)

-- Admin access for mentee_interests
CREATE POLICY "Admins can view all mentee interests" 
ON public.mentee_interests 
FOR SELECT 
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM profiles p 
    WHERE p.id = auth.uid() 
    AND p.user_type = 'admin'
  )
);

-- Admin access for mentee_academic_records
CREATE POLICY "Admins can view all academic records" 
ON public.mentee_academic_records 
FOR SELECT 
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM profiles p 
    WHERE p.id = auth.uid() 
    AND p.user_type = 'admin'
  )
);

-- Admin access for mentee_courses
CREATE POLICY "Admins can view all courses" 
ON public.mentee_courses 
FOR SELECT 
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM profiles p 
    WHERE p.id = auth.uid() 
    AND p.user_type = 'admin'
  )
);

-- Admin access for mentee_projects
CREATE POLICY "Admins can view all projects" 
ON public.mentee_projects 
FOR SELECT 
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM profiles p 
    WHERE p.id = auth.uid() 
    AND p.user_type = 'admin'
  )
);

-- Admin access for mentee_essay_responses
CREATE POLICY "Admins can view all essay responses" 
ON public.mentee_essay_responses 
FOR SELECT 
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM profiles p 
    WHERE p.id = auth.uid() 
    AND p.user_type = 'admin'
  )
);

-- Admin access for referral_codes  
CREATE POLICY "Admins can view all referral codes" 
ON public.referral_codes 
FOR SELECT 
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM profiles p 
    WHERE p.id = auth.uid() 
    AND p.user_type = 'admin'
  )
);