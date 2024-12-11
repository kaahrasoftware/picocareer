export type Career = {
  id: number;
  title: string;
  description: string;
  users: string;
  salary: string;
  image_url: string;
  related_majors: string[];
  related_careers: string[];
  skills: string[];
  category?: string | null;
  level_of_study?: string | null;
  created_at?: string | null;
  featured?: boolean | null;
};