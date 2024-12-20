export interface Blog {
  id: string;
  title: string;
  content: string;
  summary: string;
  author_id: string;
  categories: string[];
  subcategories: string[];
  published: boolean;
  featured: boolean;
  created_at: string;
  updated_at: string;
}

export interface BlogWithAuthor extends Blog {
  profiles: {
    full_name: string;
    avatar_url: string | null;
  };
}