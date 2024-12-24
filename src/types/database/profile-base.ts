export interface ProfileBase {
  id: string;
  full_name: string | null;
  first_name: string | null;
  last_name: string | null;
  avatar_url: string | null;
  email: string;
  created_at: string;
  updated_at: string;
}