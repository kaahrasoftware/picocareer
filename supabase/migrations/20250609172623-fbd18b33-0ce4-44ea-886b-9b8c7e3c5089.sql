
-- Create enum for academic status
CREATE TYPE academic_status AS ENUM (
  'current_student',
  'gap_year', 
  'graduated',
  'transfer_student',
  'prospective_student'
);

-- Create enum for course status
CREATE TYPE course_status AS ENUM (
  'completed',
  'in_progress',
  'planned',
  'dropped'
);

-- Create enum for project status
CREATE TYPE project_status AS ENUM (
  'completed',
  'in_progress',
  'planned',
  'on_hold'
);

-- Create enum for essay prompt categories
CREATE TYPE essay_prompt_category AS ENUM (
  'college_application',
  'scholarship',
  'personal_statement',
  'supplemental',
  'creative_writing',
  'academic_reflection'
);

-- Create enum for interest categories
CREATE TYPE interest_category AS ENUM (
  'career',
  'academic',
  'extracurricular',
  'hobby',
  'industry',
  'skill'
);

-- Add new fields to profiles table for mentees
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS city text;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS country text;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS current_gpa numeric(3,2);
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS graduation_year integer;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS academic_status academic_status;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS class_rank integer;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS total_credits integer;

-- Create essay_prompts table for admin management
CREATE TABLE IF NOT EXISTS essay_prompts (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title text NOT NULL,
  prompt_text text NOT NULL,
  category essay_prompt_category NOT NULL DEFAULT 'personal_statement',
  word_limit integer,
  is_active boolean NOT NULL DEFAULT true,
  created_by uuid REFERENCES profiles(id),
  created_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now())
);

-- Create mentee_essay_responses table
CREATE TABLE IF NOT EXISTS mentee_essay_responses (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  mentee_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  prompt_id uuid NOT NULL REFERENCES essay_prompts(id) ON DELETE CASCADE,
  response_text text,
  word_count integer DEFAULT 0,
  is_draft boolean NOT NULL DEFAULT true,
  version integer NOT NULL DEFAULT 1,
  created_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
  UNIQUE(mentee_id, prompt_id, version)
);

-- Create mentee_courses table
CREATE TABLE IF NOT EXISTS mentee_courses (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  mentee_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  course_name text NOT NULL,
  course_code text,
  credits numeric(3,1),
  semester text,
  year integer,
  grade text,
  status course_status NOT NULL DEFAULT 'completed',
  instructor_name text,
  description text,
  created_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now())
);

-- Create mentee_projects table
CREATE TABLE IF NOT EXISTS mentee_projects (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  mentee_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text,
  status project_status NOT NULL DEFAULT 'completed',
  start_date date,
  end_date date,
  technologies text[],
  github_url text,
  live_demo_url text,
  image_urls text[],
  collaborators text[],
  skills_used text[],
  created_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now())
);

-- Create mentee_academic_records table
CREATE TABLE IF NOT EXISTS mentee_academic_records (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  mentee_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  semester text NOT NULL,
  year integer NOT NULL,
  semester_gpa numeric(3,2),
  cumulative_gpa numeric(3,2),
  credits_attempted integer,
  credits_earned integer,
  class_rank integer,
  honors text[],
  awards text[],
  created_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
  UNIQUE(mentee_id, semester, year)
);

-- Create mentee_interests table
CREATE TABLE IF NOT EXISTS mentee_interests (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  mentee_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  interest_name text NOT NULL,
  category interest_category NOT NULL,
  description text,
  proficiency_level text,
  related_career_id uuid REFERENCES careers(id),
  related_major_id uuid REFERENCES majors(id),
  created_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now())
);

-- Enable RLS on all new tables
ALTER TABLE essay_prompts ENABLE ROW LEVEL SECURITY;
ALTER TABLE mentee_essay_responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE mentee_courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE mentee_projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE mentee_academic_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE mentee_interests ENABLE ROW LEVEL SECURITY;

-- RLS policies for essay_prompts (public read, admin write)
CREATE POLICY "Anyone can view active essay prompts" 
  ON essay_prompts 
  FOR SELECT 
  USING (is_active = true);

CREATE POLICY "Admins can manage essay prompts" 
  ON essay_prompts 
  FOR ALL 
  USING (EXISTS (
    SELECT 1 FROM profiles 
    WHERE id = auth.uid() AND user_type = 'admin'
  ));

-- RLS policies for mentee_essay_responses (mentees can manage their own)
CREATE POLICY "Mentees can view their own essay responses" 
  ON mentee_essay_responses 
  FOR SELECT 
  USING (auth.uid() = mentee_id);

CREATE POLICY "Mentees can create their own essay responses" 
  ON mentee_essay_responses 
  FOR INSERT 
  WITH CHECK (auth.uid() = mentee_id);

CREATE POLICY "Mentees can update their own essay responses" 
  ON mentee_essay_responses 
  FOR UPDATE 
  USING (auth.uid() = mentee_id);

CREATE POLICY "Mentees can delete their own essay responses" 
  ON mentee_essay_responses 
  FOR DELETE 
  USING (auth.uid() = mentee_id);

-- RLS policies for mentee_courses
CREATE POLICY "Mentees can view their own courses" 
  ON mentee_courses 
  FOR SELECT 
  USING (auth.uid() = mentee_id);

CREATE POLICY "Mentees can create their own courses" 
  ON mentee_courses 
  FOR INSERT 
  WITH CHECK (auth.uid() = mentee_id);

CREATE POLICY "Mentees can update their own courses" 
  ON mentee_courses 
  FOR UPDATE 
  USING (auth.uid() = mentee_id);

CREATE POLICY "Mentees can delete their own courses" 
  ON mentee_courses 
  FOR DELETE 
  USING (auth.uid() = mentee_id);

-- RLS policies for mentee_projects
CREATE POLICY "Mentees can view their own projects" 
  ON mentee_projects 
  FOR SELECT 
  USING (auth.uid() = mentee_id);

CREATE POLICY "Mentees can create their own projects" 
  ON mentee_projects 
  FOR INSERT 
  WITH CHECK (auth.uid() = mentee_id);

CREATE POLICY "Mentees can update their own projects" 
  ON mentee_projects 
  FOR UPDATE 
  USING (auth.uid() = mentee_id);

CREATE POLICY "Mentees can delete their own projects" 
  ON mentee_projects 
  FOR DELETE 
  USING (auth.uid() = mentee_id);

-- RLS policies for mentee_academic_records
CREATE POLICY "Mentees can view their own academic records" 
  ON mentee_academic_records 
  FOR SELECT 
  USING (auth.uid() = mentee_id);

CREATE POLICY "Mentees can create their own academic records" 
  ON mentee_academic_records 
  FOR INSERT 
  WITH CHECK (auth.uid() = mentee_id);

CREATE POLICY "Mentees can update their own academic records" 
  ON mentee_academic_records 
  FOR UPDATE 
  USING (auth.uid() = mentee_id);

CREATE POLICY "Mentees can delete their own academic records" 
  ON mentee_academic_records 
  FOR DELETE 
  USING (auth.uid() = mentee_id);

-- RLS policies for mentee_interests
CREATE POLICY "Mentees can view their own interests" 
  ON mentee_interests 
  FOR SELECT 
  USING (auth.uid() = mentee_id);

CREATE POLICY "Mentees can create their own interests" 
  ON mentee_interests 
  FOR INSERT 
  WITH CHECK (auth.uid() = mentee_id);

CREATE POLICY "Mentees can update their own interests" 
  ON mentee_interests 
  FOR UPDATE 
  USING (auth.uid() = mentee_id);

CREATE POLICY "Mentees can delete their own interests" 
  ON mentee_interests 
  FOR DELETE 
  USING (auth.uid() = mentee_id);

-- Create triggers for updated_at timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_essay_prompts_updated_at 
  BEFORE UPDATE ON essay_prompts 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_mentee_essay_responses_updated_at 
  BEFORE UPDATE ON mentee_essay_responses 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_mentee_courses_updated_at 
  BEFORE UPDATE ON mentee_courses 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_mentee_projects_updated_at 
  BEFORE UPDATE ON mentee_projects 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_mentee_academic_records_updated_at 
  BEFORE UPDATE ON mentee_academic_records 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_mentee_interests_updated_at 
  BEFORE UPDATE ON mentee_interests 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert some default essay prompts
INSERT INTO essay_prompts (title, prompt_text, category, word_limit, is_active) VALUES
('Personal Statement', 'Write a personal statement that describes your academic and career goals, your motivation for pursuing higher education, and how your experiences have shaped your aspirations.', 'personal_statement', 650, true),
('Diversity and Inclusion', 'Describe how your background, identity, interests, or talents would contribute to the diversity of our academic community.', 'college_application', 500, true),
('Leadership Experience', 'Tell us about a time when you demonstrated leadership. What did you learn about yourself and others?', 'college_application', 400, true),
('Academic Interest', 'Explain your interest in your chosen field of study and how it relates to your future career goals.', 'academic_reflection', 500, true),
('Overcoming Challenges', 'Describe a challenge you have overcome and how it has influenced your character and goals.', 'personal_statement', 600, true),
('Community Impact', 'How have you made a positive impact in your community? What did you learn from this experience?', 'scholarship', 450, true);
