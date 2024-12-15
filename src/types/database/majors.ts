export interface Major {
  id: string;
  title: string;
  description: string;
  image_url: string;
  created_at: string;
  updated_at: string;
  featured: boolean;
  field_of_study: string;
  required_courses: string[];
  degree_level: string;
  duration: string;
  career_opportunities: string[];
  keywords: string[];
}