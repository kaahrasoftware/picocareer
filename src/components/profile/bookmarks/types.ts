
export interface CareerProfile {
  id: string;
  title: string;
  description?: string;
  salary_range?: string;
  image_url?: string;
  industry?: string;
  profiles_count?: number;
}

export interface MajorProfile {
  id: string;
  title: string;
  description?: string;
  image_url?: string;
  category?: string;
  profiles_count?: number;
}

export interface MentorProfile {
  id: string;
  full_name: string;
  position?: string;
  company_name?: string;
  location?: string;
  bio?: string;
  avatar_url?: string;
}

export interface ScholarshipProfile {
  id: string;
  name: string;
  provider?: string;
  amount?: string;
  deadline?: string;
  image_url?: string;
}

export interface EmptyStateProps {
  icon: React.ReactNode;
  linkPath: string;
  type: string;
}
