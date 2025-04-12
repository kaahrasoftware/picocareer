
export interface Mentor {
  id: string;
  name: string;
  title?: string;
  company?: string;
  imageUrl: string;
  stats?: {
    mentees: string;
    connected: string;
    recordings: string;
  };
  top_mentor?: boolean;
  position?: string;
  career_title?: string;
  location?: string;
  bio?: string;
  skills?: string[];
  education?: string;
  sessionsHeld?: string;
  rating?: number;
  totalRatings?: number;
}
