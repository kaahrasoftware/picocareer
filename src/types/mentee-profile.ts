
export interface MenteeEssayResponse {
  id: string;
  prompt_id: string;
  mentee_id: string;
  response_text?: string;
  word_count?: number;
  is_draft: boolean;
  version: number;
  created_at: string;
  updated_at: string;
}

export interface MenteeProject {
  id: string;
  mentee_id: string;
  title: string;
  description?: string;
  status: 'completed' | 'in_progress' | 'planned';
  start_date?: string;
  end_date?: string;
  github_url?: string;
  live_demo_url?: string;
  image_urls?: string[];
  collaborators?: string[];
  skills_used?: string[];
  technologies?: string[];
  created_at: string;
  updated_at: string;
}
