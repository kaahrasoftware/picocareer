
export interface ScholarshipDetails {
  id: string;
  title: string;
  description: string;
  amount: number;
  currency: string;
  application_deadline: string;
  eligibility_criteria: string[];
  application_url: string;
  provider_name: string;
  category: string[];
  academic_requirements: any;
  application_open_date: string;
  application_process: string;
  award_frequency: string;
  contact_email: string;
  contact_phone: string;
  created_at: string;
  updated_at: string;
  author_id: string;
  status: string;
  featured: boolean;
  cover_image_url: string;
  tags: string[];
  views_count: number;
  bookmarks_count: number;
}
