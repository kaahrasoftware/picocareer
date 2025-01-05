export interface SearchResult {
  id: string;
  type: 'mentor' | 'career' | 'major';
  title: string;
  description?: string;
  avatar_url?: string;
  top_mentor?: boolean;
  salary_range?: string;
  degree_levels?: string[];
  company?: { name: string } | null;
  position?: string;
  career?: { title: string } | null;
  location?: string;
}