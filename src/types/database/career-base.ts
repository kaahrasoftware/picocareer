export interface CareerBase {
  id: string;
  title: string;
  description: string;
  salary_range: string | null;
  image_url: string | null;
  created_at: string;
  updated_at: string;
  featured: boolean | null;
  complete_career: boolean | null;
}