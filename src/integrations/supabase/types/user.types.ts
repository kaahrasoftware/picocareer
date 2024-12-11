import { Stats } from './stats.types';

export interface User {
  id: string;
  title: string;
  company: string;
  image_url: string;
  name: string;
  username: string;
  bio: string | null;
  position: string | null;
  education: string | null;
  sessions_held: string | null;
  stats: Stats;
  created_at: string | null;
  user_type: string | null;
  top_rated: boolean | null;
  skills: string[] | null;
  tools: string[] | null;
  keywords: string[] | null;
  email: string | null;
  password: string;
}