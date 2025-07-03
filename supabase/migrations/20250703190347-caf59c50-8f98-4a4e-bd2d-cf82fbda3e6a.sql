
-- Create enum types for assessment
CREATE TYPE assessment_status AS ENUM ('in_progress', 'completed');
CREATE TYPE question_type AS ENUM ('multiple_choice', 'multiple_select', 'scale', 'text');

-- Create assessment questions table
CREATE TABLE public.assessment_questions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  type question_type NOT NULL,
  options JSONB,
  order_index INTEGER NOT NULL,
  is_required BOOLEAN NOT NULL DEFAULT true,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT timezone('utc'::text, now())
);

-- Create career assessments table
CREATE TABLE public.career_assessments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  status assessment_status NOT NULL DEFAULT 'in_progress',
  started_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT timezone('utc'::text, now()),
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT timezone('utc'::text, now())
);

-- Create assessment responses table
CREATE TABLE public.assessment_responses (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  assessment_id UUID NOT NULL REFERENCES public.career_assessments(id) ON DELETE CASCADE,
  question_id UUID NOT NULL REFERENCES public.assessment_questions(id) ON DELETE CASCADE,
  answer JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT timezone('utc'::text, now()),
  UNIQUE(assessment_id, question_id)
);

-- Create career recommendations table
CREATE TABLE public.career_recommendations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  assessment_id UUID NOT NULL REFERENCES public.career_assessments(id) ON DELETE CASCADE,
  career_id UUID REFERENCES public.careers(id),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  match_score INTEGER NOT NULL CHECK (match_score >= 0 AND match_score <= 100),
  reasoning TEXT NOT NULL,
  salary_range TEXT,
  growth_outlook TEXT,
  time_to_entry TEXT,
  required_skills TEXT[],
  education_requirements TEXT[],
  work_environment TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT timezone('utc'::text, now())
);

-- Insert sample assessment questions
INSERT INTO public.assessment_questions (title, description, type, options, order_index) VALUES
('What are your primary interests?', 'Select all areas that genuinely interest you', 'multiple_select', '["Technology & Innovation", "Healthcare & Medicine", "Arts & Creativity", "Business & Finance", "Education & Training", "Science & Research", "Social Services", "Engineering", "Law & Government", "Media & Communication"]', 1),
('How important is work-life balance to you?', 'Rate the importance of work-life balance in your career', 'scale', '{"min": 1, "max": 5, "labels": {"1": "Not Important", "3": "Moderately Important", "5": "Extremely Important"}}', 2),
('What type of work environment do you prefer?', 'Choose your preferred work setting', 'multiple_choice', '["Office-based", "Remote/Work from home", "Hybrid (mix of office and remote)", "Outdoor/Field work", "Laboratory/Clinical setting", "Creative studio", "No preference"]', 3),
('How do you prefer to work with others?', 'Select your preferred collaboration style', 'multiple_choice', '["Independently with minimal supervision", "Small team collaboration", "Large team projects", "Leadership/Management role", "Mix of independent and team work"]', 4),
('What motivates you most in your career?', 'Choose your primary career motivator', 'multiple_choice', '["Making a positive impact on society", "Financial success and stability", "Creative expression and innovation", "Intellectual challenges and learning", "Recognition and achievement", "Helping and serving others", "Job security and stability"]', 5),
('How comfortable are you with technology?', 'Rate your comfort level with technology and digital tools', 'scale', '{"min": 1, "max": 5, "labels": {"1": "Not Comfortable", "3": "Moderately Comfortable", "5": "Very Comfortable"}}', 6),
('What is your preferred education level for your career?', 'Select the highest level of education you are willing to pursue', 'multiple_choice', '["High school diploma", "Associate degree", "Bachelor''s degree", "Master''s degree", "Doctoral degree", "Professional certification", "No formal education required"]', 7),
('How do you handle stress and pressure?', 'Choose the statement that best describes your stress management', 'multiple_choice', '["I thrive under high pressure and tight deadlines", "I work well with moderate pressure", "I prefer low-stress environments", "I can adapt to various stress levels", "I avoid high-pressure situations"]', 8),
('What are your strongest skills?', 'Select your top skills and abilities', 'multiple_select', '["Communication and presentation", "Problem-solving and analysis", "Leadership and management", "Technical and computer skills", "Creativity and design", "Mathematical and analytical", "Interpersonal and social", "Organization and planning", "Research and investigation", "Manual dexterity and craftsmanship"]', 9),
('What type of career growth do you envision?', 'Choose your preferred career progression path', 'multiple_choice', '["Climbing the corporate ladder to executive level", "Becoming a specialist expert in my field", "Starting my own business or consulting", "Maintaining work-life balance with steady growth", "Frequent career changes and new challenges", "Contributing to meaningful causes regardless of advancement"]', 10);

-- Enable Row Level Security
ALTER TABLE public.assessment_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.career_assessments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assessment_responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.career_recommendations ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for assessment_questions
CREATE POLICY "Assessment questions are viewable by everyone" 
ON public.assessment_questions FOR SELECT 
USING (is_active = true);

CREATE POLICY "Only admins can manage assessment questions" 
ON public.assessment_questions FOR ALL 
USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND user_type = 'admin'));

-- Create RLS policies for career_assessments
CREATE POLICY "Users can view their own assessments" 
ON public.career_assessments FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own assessments" 
ON public.career_assessments FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own assessments" 
ON public.career_assessments FOR UPDATE 
USING (auth.uid() = user_id);

-- Create RLS policies for assessment_responses
CREATE POLICY "Users can view their own assessment responses" 
ON public.assessment_responses FOR SELECT 
USING (EXISTS (SELECT 1 FROM career_assessments WHERE id = assessment_responses.assessment_id AND user_id = auth.uid()));

CREATE POLICY "Users can create their own assessment responses" 
ON public.assessment_responses FOR INSERT 
WITH CHECK (EXISTS (SELECT 1 FROM career_assessments WHERE id = assessment_responses.assessment_id AND user_id = auth.uid()));

CREATE POLICY "Users can update their own assessment responses" 
ON public.assessment_responses FOR UPDATE 
USING (EXISTS (SELECT 1 FROM career_assessments WHERE id = assessment_responses.assessment_id AND user_id = auth.uid()));

-- Create RLS policies for career_recommendations
CREATE POLICY "Users can view their own career recommendations" 
ON public.career_recommendations FOR SELECT 
USING (EXISTS (SELECT 1 FROM career_assessments WHERE id = career_recommendations.assessment_id AND user_id = auth.uid()));

CREATE POLICY "Only the system can create career recommendations" 
ON public.career_recommendations FOR INSERT 
WITH CHECK (EXISTS (SELECT 1 FROM career_assessments WHERE id = career_recommendations.assessment_id AND user_id = auth.uid()));

-- Create indexes for better performance
CREATE INDEX idx_career_assessments_user_id ON public.career_assessments (user_id);
CREATE INDEX idx_assessment_responses_assessment_id ON public.assessment_responses (assessment_id);
CREATE INDEX idx_career_recommendations_assessment_id ON public.career_recommendations (assessment_id);
CREATE INDEX idx_assessment_questions_order ON public.assessment_questions (order_index) WHERE is_active = true;

-- Create updated_at triggers
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;   
END;
$$ language 'plpgsql';

CREATE TRIGGER update_assessment_questions_updated_at BEFORE UPDATE ON public.assessment_questions FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_career_assessments_updated_at BEFORE UPDATE ON public.career_assessments FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
