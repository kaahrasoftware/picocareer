export type BlogWithAuthor = {
  id: string;
  title: string;
  summary: string;
  content: string;
  author_id: string;
  image_url: string | null;
  created_at: string;
  updated_at: string;
  category: string | null;
  subcategory: string | null;
  is_recent: boolean | null;
  cover_image_url: string | null;
  profiles: {
    full_name: string | null;
    avatar_url: string | null;
  } | null;
};