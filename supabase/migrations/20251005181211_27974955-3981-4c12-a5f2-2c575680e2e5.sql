-- Create career pathways table (6 main areas from CBC diagram)
CREATE TABLE IF NOT EXISTS public.career_pathways (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  color TEXT NOT NULL,
  icon TEXT,
  order_index INTEGER NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create subject clusters table (middle ring from CBC diagram)
CREATE TABLE IF NOT EXISTS public.subject_clusters (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  pathway_id UUID NOT NULL REFERENCES public.career_pathways(id) ON DELETE CASCADE,
  description TEXT,
  order_index INTEGER NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create career to subject cluster mapping
CREATE TABLE IF NOT EXISTS public.career_subject_mapping (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  career_id UUID NOT NULL REFERENCES public.careers(id) ON DELETE CASCADE,
  subject_cluster_id UUID NOT NULL REFERENCES public.subject_clusters(id) ON DELETE CASCADE,
  relevance_score INTEGER DEFAULT 1,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(career_id, subject_cluster_id)
);

-- Add new fields to assessment_questions table
ALTER TABLE public.assessment_questions 
ADD COLUMN IF NOT EXISTS pathway_tier TEXT CHECK (pathway_tier IN ('profile_detection', 'career_choice', 'subject_cluster', 'refinement', 'practical')),
ADD COLUMN IF NOT EXISTS related_pathway_ids UUID[] DEFAULT ARRAY[]::UUID[],
ADD COLUMN IF NOT EXISTS related_cluster_ids UUID[] DEFAULT ARRAY[]::UUID[],
ADD COLUMN IF NOT EXISTS visual_config JSONB DEFAULT '{}'::jsonb;

-- Enable RLS on new tables
ALTER TABLE public.career_pathways ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subject_clusters ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.career_subject_mapping ENABLE ROW LEVEL SECURITY;

-- RLS Policies for career_pathways
CREATE POLICY "Pathways are viewable by everyone"
ON public.career_pathways FOR SELECT
USING (true);

CREATE POLICY "Only admins can manage pathways"
ON public.career_pathways FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE id = auth.uid() AND user_type = 'admin'
  )
);

-- RLS Policies for subject_clusters
CREATE POLICY "Subject clusters are viewable by everyone"
ON public.subject_clusters FOR SELECT
USING (true);

CREATE POLICY "Only admins can manage subject clusters"
ON public.subject_clusters FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE id = auth.uid() AND user_type = 'admin'
  )
);

-- RLS Policies for career_subject_mapping
CREATE POLICY "Career mappings are viewable by everyone"
ON public.career_subject_mapping FOR SELECT
USING (true);

CREATE POLICY "Only admins can manage career mappings"
ON public.career_subject_mapping FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE id = auth.uid() AND user_type = 'admin'
  )
);

-- Insert the 6 main Career Pathways from CBC diagram
INSERT INTO public.career_pathways (title, description, color, icon, order_index) VALUES
('STEM', 'Science, Technology, Engineering, and Mathematics', '#00A6D4', 'Atom', 1),
('Business Studies', 'Business, Economics, and Management', '#012169', 'Briefcase', 2),
('Humanities & Social Sciences', 'Liberal Arts, Social Sciences, and Human Behavior', '#00A6D4', 'BookOpen', 3),
('Arts & Design', 'Creative Arts, Design, and Media', '#012169', 'Palette', 4),
('Healthcare & Life Sciences', 'Medicine, Health, and Life Sciences', '#00A6D4', 'Heart', 5),
('Skilled Trades & Services', 'Technical Trades and Service Industries', '#012169', 'Wrench', 6);

-- Insert Subject Clusters for STEM pathway
INSERT INTO public.subject_clusters (title, pathway_id, description, order_index)
SELECT 'Pure Science', id, 'Fundamental scientific research and theory', 1
FROM public.career_pathways WHERE title = 'STEM'
UNION ALL
SELECT 'Technical & Engineering', id, 'Applied engineering and technical fields', 2
FROM public.career_pathways WHERE title = 'STEM'
UNION ALL
SELECT 'Applied Science', id, 'Practical applications of scientific principles', 3
FROM public.career_pathways WHERE title = 'STEM';

-- Insert Subject Clusters for Business Studies
INSERT INTO public.subject_clusters (title, pathway_id, description, order_index)
SELECT 'Business & Management', id, 'Corporate management and business operations', 1
FROM public.career_pathways WHERE title = 'Business Studies'
UNION ALL
SELECT 'Finance & Economics', id, 'Financial systems and economic analysis', 2
FROM public.career_pathways WHERE title = 'Business Studies';

-- Insert Subject Clusters for Humanities & Social Sciences
INSERT INTO public.subject_clusters (title, pathway_id, description, order_index)
SELECT 'Social Sciences', id, 'Study of human society and social relationships', 1
FROM public.career_pathways WHERE title = 'Humanities & Social Sciences'
UNION ALL
SELECT 'Liberal Arts & Humanities', id, 'Literature, philosophy, and cultural studies', 2
FROM public.career_pathways WHERE title = 'Humanities & Social Sciences';

-- Insert Subject Clusters for Arts & Design
INSERT INTO public.subject_clusters (title, pathway_id, description, order_index)
SELECT 'Creative Arts', id, 'Visual arts, performing arts, and creative expression', 1
FROM public.career_pathways WHERE title = 'Arts & Design'
UNION ALL
SELECT 'Design & Media', id, 'Design thinking and media production', 2
FROM public.career_pathways WHERE title = 'Arts & Design';

-- Insert Subject Clusters for Healthcare & Life Sciences
INSERT INTO public.subject_clusters (title, pathway_id, description, order_index)
SELECT 'Medical Sciences', id, 'Clinical medicine and healthcare', 1
FROM public.career_pathways WHERE title = 'Healthcare & Life Sciences'
UNION ALL
SELECT 'Life Sciences', id, 'Biology, genetics, and life systems', 2
FROM public.career_pathways WHERE title = 'Healthcare & Life Sciences';

-- Insert Subject Clusters for Skilled Trades & Services
INSERT INTO public.subject_clusters (title, pathway_id, description, order_index)
SELECT 'Technical Trades', id, 'Skilled manual and technical work', 1
FROM public.career_pathways WHERE title = 'Skilled Trades & Services'
UNION ALL
SELECT 'Service Industries', id, 'Service-oriented professions', 2
FROM public.career_pathways WHERE title = 'Skilled Trades & Services';

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_subject_clusters_pathway ON public.subject_clusters(pathway_id);
CREATE INDEX IF NOT EXISTS idx_career_mapping_career ON public.career_subject_mapping(career_id);
CREATE INDEX IF NOT EXISTS idx_career_mapping_cluster ON public.career_subject_mapping(subject_cluster_id);
CREATE INDEX IF NOT EXISTS idx_assessment_questions_pathway_tier ON public.assessment_questions(pathway_tier);
CREATE INDEX IF NOT EXISTS idx_assessment_questions_related_pathways ON public.assessment_questions USING GIN(related_pathway_ids);