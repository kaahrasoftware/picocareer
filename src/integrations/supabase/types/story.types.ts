export interface Story {
  id: string;
  mentor_id: string;
  content: string;
  title: string;
  created_at: string | null;
  expires_at: string | null;
  is_active: boolean | null;
}