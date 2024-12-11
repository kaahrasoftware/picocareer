export interface Career {
  id: number;
  title: string;
  description: string;
  users: string;
  salary: string;
  image_url: string;
  related_majors: string[];
  related_careers: string[];
  skills: string[];
  category?: string;
  level_of_study?: string;
  created_at?: string;
  featured?: boolean;
}

export interface CareerDetails {
  id: number;
  title: string;
  description: string;
  users: string;
  salary: string;
  imageUrl: string;
  relatedMajors: string[];
  relatedCareers: string[];
  skills: string[];
}

export const careerToCareerDetails = (career: Career): CareerDetails => ({
  id: career.id,
  title: career.title,
  description: career.description,
  users: career.users,
  salary: career.salary,
  imageUrl: career.image_url,
  relatedMajors: career.related_majors,
  relatedCareers: career.related_careers,
  skills: career.skills
});