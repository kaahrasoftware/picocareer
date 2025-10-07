-- Update existing assessment questions with pathway_tier classification
-- Profile detection questions (order_index 1-2)
UPDATE assessment_questions
SET pathway_tier = 'profile_detection'
WHERE order_index IN (1, 2);

-- Refinement questions (order_index 10-32 - profile-specific questions)
UPDATE assessment_questions
SET pathway_tier = 'refinement'
WHERE order_index BETWEEN 10 AND 32;

-- Practical questions (order_index 40+ - work experience, preferences)
UPDATE assessment_questions
SET pathway_tier = 'practical'
WHERE order_index >= 40;

-- Insert Career Pathway Selection Question (career_choice tier)
INSERT INTO assessment_questions (
  title,
  description,
  type,
  order_index,
  is_required,
  is_active,
  profile_type,
  target_audience,
  pathway_tier,
  visual_config
) VALUES (
  'Which career pathways interest you most?',
  'Select 1-3 pathways that align with your interests and goals. These will help us recommend specific subject areas and careers.',
  'multiple_select',
  5,
  true,
  true,
  ARRAY['middle_school', 'high_school', 'college', 'career_professional'],
  ARRAY['all'],
  'career_choice',
  '{"layout": "cards", "icon": "compass", "color": "primary"}'::jsonb
);

-- Insert Subject Cluster Selection Question (subject_cluster tier)
INSERT INTO assessment_questions (
  title,
  description,
  type,
  order_index,
  is_required,
  is_active,
  profile_type,
  target_audience,
  pathway_tier,
  visual_config
) VALUES (
  'Which subject areas would you like to explore?',
  'Based on your pathway selections, choose up to 5 subject clusters that interest you most. This will refine your career recommendations.',
  'multiple_select',
  6,
  true,
  true,
  ARRAY['middle_school', 'high_school', 'college', 'career_professional'],
  ARRAY['all'],
  'subject_cluster',
  '{"layout": "grid", "icon": "layers", "color": "secondary"}'::jsonb
);