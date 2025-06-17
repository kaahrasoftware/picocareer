
import { Json } from './supabase';

export interface ScholarshipDetails {
  id: string;
  title: string;
  description: string;
  amount: number;
  currency: string;
  application_deadline: string;
  application_url: string;
  eligibility_criteria: string[];
  category: string[];
  academic_requirements: Json;
  application_process: string;
  award_frequency: string;
  number_of_awards: number;
  renewable: boolean;
  contact_email: string | null;
  contact_phone: string | null;
  organization_name: string;
  organization_website: string | null;
  application_open_date: string;
  notification_date: string | null;
  special_requirements: string | null;
  essay_requirements: string | null;
  recommendation_letters: number;
  status: "Pending" | "Approved" | "Rejected";
  featured: boolean;
  created_at: string;
  updated_at: string;
  author_id: string;
  views_count: number;
  bookmarks_count: number;
  applications_count: number;
}
