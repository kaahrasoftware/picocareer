export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface User {
  id: number;
  title: string;
  company: string;
  image_url: string;
  name: string;
  username: string;
  bio: string | null;
  position: string | null;
  education: string | null;
  sessions_held: string | null;
  stats: Json;
  created_at: string | null;
  user_type: string | null;
  top_rated: boolean | null;
  skills: string[] | null;
  tools: string[] | null;
  keywords: string[] | null;
}