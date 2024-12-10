export type Major = {
  id: number;
  title: string;
  description: string;
  users: string;
  image_url: string;
  related_careers: string[];
  required_courses: string[];
  average_gpa: string;
  category: string | null;
  level_of_study: string | null;
  created_at: string | null;
};