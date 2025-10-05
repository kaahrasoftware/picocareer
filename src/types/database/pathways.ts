export interface CareerPathway {
  id: string;
  title: string;
  description: string | null;
  color: string;
  icon: string | null;
  order_index: number;
  created_at: string;
  updated_at: string;
}

export interface SubjectCluster {
  id: string;
  title: string;
  pathway_id: string;
  description: string | null;
  order_index: number;
  created_at: string;
  updated_at: string;
}

export interface CareerSubjectMapping {
  id: string;
  career_id: string;
  subject_cluster_id: string;
  relevance_score: number | null;
  created_at: string;
}

export type PathwayTier = 
  | 'profile_detection' 
  | 'career_choice' 
  | 'subject_cluster' 
  | 'refinement' 
  | 'practical';
