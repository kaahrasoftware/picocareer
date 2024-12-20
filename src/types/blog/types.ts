import type { Profile } from "@/types/database/profile";

export interface Blog {
  id: string;
  title: string;
  content: string;
  summary: string | null;
  author_id: string | null;
  categories: string[] | null;
  subcategories: string[] | null;
  published: boolean | null;
  featured: boolean | null;
  is_recent: boolean | null;
  created_at: string | null;
  updated_at: string | null;
}

export interface BlogWithAuthor extends Blog {
  profiles?: Profile | null;
}