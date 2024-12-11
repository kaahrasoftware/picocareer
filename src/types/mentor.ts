export interface Mentor {
  id: string;
  title: string;
  company: string;
  imageUrl: string;
  name: string;
  stats: {
    mentees: string;
    connected: string;
    recordings: string;
  };
  username: string;
  education?: string;
  sessionsHeld?: string;
  position?: string;
}