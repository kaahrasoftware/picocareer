
-- Add RLS policies to allow mentors and admins to view mentee data

-- For mentee_academic_records table
CREATE POLICY "Mentors and admins can view mentee academic records" 
  ON public.mentee_academic_records 
  FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() 
      AND user_type IN ('mentor', 'admin')
    )
  );

-- For mentee_courses table
CREATE POLICY "Mentors and admins can view mentee courses" 
  ON public.mentee_courses 
  FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() 
      AND user_type IN ('mentor', 'admin')
    )
  );

-- For mentee_essay_responses table
CREATE POLICY "Mentors and admins can view mentee essay responses" 
  ON public.mentee_essay_responses 
  FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() 
      AND user_type IN ('mentor', 'admin')
    )
  );

-- For mentee_interests table
CREATE POLICY "Mentors and admins can view mentee interests" 
  ON public.mentee_interests 
  FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() 
      AND user_type IN ('mentor', 'admin')
    )
  );

-- For mentee_projects table
CREATE POLICY "Mentors and admins can view mentee projects" 
  ON public.mentee_projects 
  FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() 
      AND user_type IN ('mentor', 'admin')
    )
  );

-- For profiles table - allow mentors and admins to view mentee profiles
CREATE POLICY "Mentors and admins can view mentee profiles" 
  ON public.profiles 
  FOR SELECT 
  USING (
    user_type = 'mentee' AND 
    EXISTS (
      SELECT 1 FROM profiles viewer
      WHERE viewer.id = auth.uid() 
      AND viewer.user_type IN ('mentor', 'admin')
    )
  );
