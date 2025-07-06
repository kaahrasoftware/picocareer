
-- Add missing columns to assessment_questions table
ALTER TABLE assessment_questions 
ADD COLUMN IF NOT EXISTS profile_type text[] DEFAULT NULL,
ADD COLUMN IF NOT EXISTS target_audience text[] DEFAULT NULL,
ADD COLUMN IF NOT EXISTS prerequisites jsonb DEFAULT NULL,
ADD COLUMN IF NOT EXISTS conditional_logic jsonb DEFAULT NULL;

-- Create enum for profile types if it doesn't exist
DO $$ BEGIN
    CREATE TYPE profile_type_enum AS ENUM (
      'middle_school',
      'high_school', 
      'college',
      'career_professional'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Add profile detection columns to career_assessments table
ALTER TABLE career_assessments
ADD COLUMN IF NOT EXISTS detected_profile_type profile_type_enum DEFAULT NULL,
ADD COLUMN IF NOT EXISTS profile_detection_completed boolean DEFAULT false;

-- Clear existing questions to start fresh
DELETE FROM assessment_questions;

-- Insert profile detection questions (these show first for everyone)
INSERT INTO assessment_questions (
  title, 
  description, 
  type, 
  options, 
  order_index, 
  is_required, 
  is_active,
  profile_type,
  target_audience
) VALUES 
(
  'What is your current academic or professional status?',
  'This helps us tailor the assessment to your current life stage.',
  'multiple_choice',
  '["Middle school student (grades 6-8)", "High school student (grades 9-12)", "College/University student", "Working professional looking to transition careers", "Recent graduate entering the workforce", "Other"]'::jsonb,
  1,
  true,
  true,
  '["middle_school", "high_school", "college", "career_professional"]'::text[],
  '["all"]'::text[]
),
(
  'How familiar are you with different career options?',
  'Understanding your career awareness helps us provide better guidance.',
  'multiple_choice',
  '["Very limited - just getting started", "Some awareness of basic careers", "Good understanding of careers in my field of interest", "Extensive knowledge across multiple industries", "Professional experience in multiple roles"]'::jsonb,
  2,
  true,
  true,
  '["middle_school", "high_school", "college", "career_professional"]'::text[],
  '["all"]'::text[]
);

-- Insert middle school specific questions
INSERT INTO assessment_questions (
  title,
  description,
  type,
  options,
  order_index,
  is_required,
  is_active,
  profile_type,
  target_audience
) VALUES
(
  'What school subjects do you enjoy most?',
  'Your favorite subjects can give us clues about potential career interests.',
  'multiple_select',
  '["Math", "Science", "English/Language Arts", "Social Studies/History", "Art", "Music", "Physical Education", "Technology/Computers", "Foreign Languages"]'::jsonb,
  10,
  true,
  true,
  '["middle_school"]'::text[],
  '["middle_school"]'::text[]
),
(
  'What kind of activities do you like to do in your free time?',
  'Your hobbies and interests can point toward career paths you might enjoy.',
  'multiple_select',
  '["Reading books", "Playing video games", "Drawing or crafting", "Playing sports", "Building things", "Writing stories", "Solving puzzles", "Helping friends with problems", "Learning about animals", "Experimenting with science"]'::jsonb,
  11,
  true,
  true,
  '["middle_school"]'::text[],
  '["middle_school"]'::text[]
),
(
  'When you think about the future, what sounds most exciting?',
  'This helps us understand what motivates you about future careers.',
  'multiple_choice',
  '["Helping people solve problems", "Creating new things", "Working with technology", "Being creative and artistic", "Leading a team", "Working outdoors", "Traveling to new places", "Making scientific discoveries"]'::jsonb,
  12,
  true,
  true,
  '["middle_school"]'::text[],
  '["middle_school"]'::text[]
);

-- Insert high school specific questions
INSERT INTO assessment_questions (
  title,
  description,
  type,
  options,
  order_index,
  is_required,
  is_active,
  profile_type,
  target_audience
) VALUES
(
  'Which high school courses are you most interested in or excelling at?',
  'Your academic strengths can guide career exploration.',
  'multiple_select',
  '["Advanced Math (Calculus, Statistics)", "Science (Physics, Chemistry, Biology)", "Computer Science/Programming", "Business/Economics", "Psychology", "Literature/Creative Writing", "History/Government", "Foreign Languages", "Art/Design", "Engineering/Technical courses"]'::jsonb,
  20,
  true,
  true,
  '["high_school"]'::text[],
  '["high_school"]'::text[]
),
(
  'What are your plans after high school graduation?',
  'Understanding your next steps helps us provide relevant career guidance.',
  'multiple_choice',
  '["4-year college/university", "Community college", "Trade school/vocational training", "Military service", "Work immediately", "Gap year", "Still deciding"]'::jsonb,
  21,
  true,
  true,
  '["high_school"]'::text[],
  '["high_school"]'::text[]
),
(
  'What type of work environment appeals to you most?',
  'Knowing your preferred work style helps narrow career options.',
  'multiple_choice',
  '["Office setting with teamwork", "Independent work from home", "Hands-on work in a workshop/lab", "Outdoor work", "Healthcare/helping environment", "Creative studio space", "Fast-paced business environment", "Educational/teaching setting"]'::jsonb,
  22,
  true,
  true,
  '["high_school"]'::text[],
  '["high_school"]'::text[]
);

-- Insert college student specific questions
INSERT INTO assessment_questions (
  title,
  description,
  type,
  options,
  order_index,
  is_required,
  is_active,
  profile_type,
  target_audience
) VALUES
(
  'What is your current major or field of study?',
  'Your academic focus helps us understand your career preparation.',
  'text',
  NULL,
  30,
  true,
  true,
  '["college"]'::text[],
  '["college"]'::text[]
),
(
  'How confident are you that your major aligns with your career goals?',
  'This helps us understand if you need career exploration or career preparation guidance.',
  'scale',
  NULL,
  31,
  true,
  true,
  '["college"]'::text[],
  '["college"]'::text[]
),
(
  'What type of internships or work experiences have you had?',
  'Your practical experience helps us recommend next steps.',
  'multiple_select',
  '["Internships in my field", "Part-time jobs in service industry", "Research with professors", "Volunteer work", "Leadership roles in organizations", "Freelance/entrepreneurial projects", "No formal work experience yet"]'::jsonb,
  32,
  true,
  true,
  '["college"]'::text[],
  '["college"]'::text[]
);

-- Insert career professional specific questions
INSERT INTO assessment_questions (
  title,
  description,
  type,
  options,
  order_index,
  is_required,
  is_active,
  profile_type,
  target_audience
) VALUES
(
  'What is your current industry or field?',
  'Understanding your background helps us suggest relevant transition paths.',
  'text',
  NULL,
  40,
  true,
  true,
  '["career_professional"]'::text[],
  '["career_professional"]'::text[]
),
(
  'How many years of professional experience do you have?',
  'Your experience level affects the types of career transitions available to you.',
  'multiple_choice',
  '["Less than 2 years", "2-5 years", "5-10 years", "10-15 years", "15+ years"]'::jsonb,
  41,
  true,
  true,
  '["career_professional"]'::text[],
  '["career_professional"]'::text[]
),
(
  'What is motivating your desire for a career change?',
  'Understanding your motivation helps us recommend the best path forward.',
  'multiple_select',
  '["Better work-life balance", "Higher salary potential", "More meaningful work", "Career advancement opportunities", "Industry instability", "Desire for new challenges", "Location/remote work flexibility", "Personal passion/interests"]'::jsonb,
  42,
  true,
  true,
  '["career_professional"]'::text[],
  '["career_professional"]'::text[]
);

-- Insert universal questions that apply to all profile types
INSERT INTO assessment_questions (
  title,
  description,
  type,
  options,
  order_index,
  is_required,
  is_active,
  profile_type,
  target_audience
) VALUES
(
  'Which of these work activities sound most appealing to you?',
  'Understanding what you enjoy doing helps us match you with suitable careers.',
  'multiple_select',
  '["Analyzing data and solving problems", "Creating and designing things", "Teaching and mentoring others", "Leading teams and projects", "Working with technology", "Helping people with their needs", "Writing and communicating", "Working with your hands", "Researching and discovering new information"]'::jsonb,
  50,
  true,
  true,
  '["middle_school", "high_school", "college", "career_professional"]'::text[],
  '["all"]'::text[]
),
(
  'How important is work-life balance to you?',
  'This helps us recommend careers that match your lifestyle preferences.',
  'scale',
  NULL,
  51,
  true,
  true,
  '["middle_school", "high_school", "college", "career_professional"]'::text[],
  '["all"]'::text[]
),
(
  'What salary range would you eventually like to achieve?',
  'Understanding your financial goals helps us recommend appropriate career paths.',
  'multiple_choice',
  '["$30,000-$50,000", "$50,000-$75,000", "$75,000-$100,000", "$100,000-$150,000", "$150,000+", "Money is not my primary concern"]'::jsonb,
  52,
  true,
  true,
  '["high_school", "college", "career_professional"]'::text[],
  '["high_school", "college", "career_professional"]'::text[]
);

-- Add index for better performance on conditional queries
CREATE INDEX IF NOT EXISTS idx_assessment_questions_profile_type ON assessment_questions USING GIN (profile_type);
CREATE INDEX IF NOT EXISTS idx_assessment_questions_target_audience ON assessment_questions USING GIN (target_audience);
