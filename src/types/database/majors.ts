export interface Major {
  id: string;
  title: string;
  description: string;
  image_url: string | null;
  created_at: string;
  updated_at: string;
  featured: boolean | null;
  field_of_study: string | null;
  required_courses: string[] | null;
  degree_level: string | null;
  duration: string | null;
  career_opportunities: string[] | null;
  keywords: string[] | null;
}