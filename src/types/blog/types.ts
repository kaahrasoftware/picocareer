export type BlogWithAuthor = {
  id: string;
  title: string;
  summary: string;
  content: string;
  author_id: string;
  created_at: string;
  updated_at: string;
  categories: string[] | null;
  subcategories: string[] | null;
  is_recent: boolean | null;
  cover_image_url: string | null;
  other_notes: string | null;
  profiles: {
    full_name: string | null;
    avatar_url: string | null;
  } | null;
};