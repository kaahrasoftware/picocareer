
export interface MenteeEssayResponse {
  id: string;
  mentee_id: string;
  title: string;
  content: string;
  created_at: string;
  updated_at: string;
}

export interface MenteeProjectResponse {
  id: string;
  mentee_id: string;
  title: string;
  description: string;
  technologies: string[];
  github_url?: string;
  demo_url?: string;
  created_at: string;
  updated_at: string;
}
