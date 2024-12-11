export interface Career {
  id: string;
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

export interface CareerDetails extends Career {
  imageUrl: string;
  relatedMajors: string[];
  relatedCareers: string[];
}

// Helper function to convert Career to CareerDetails
export const careerToCareerDetails = (career: Career): CareerDetails => ({
  ...career,
  imageUrl: career.image_url,
  relatedMajors: career.related_majors,
  relatedCareers: career.related_careers,
});