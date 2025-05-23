import { SchoolStatus, SchoolType } from "./supabase";

export { SchoolType, SchoolStatus };

export interface School {
  id: string;
  name: string;
  type: SchoolType;
  location?: string;
  country: string;
  state?: string;
  website?: string;
  status: SchoolStatus;
  acceptance_rate?: number;
  created_at: string;
  updated_at: string;
  logo_url?: string;
  cover_image_url?: string;
  gallery_images?: Record<string, any> | null;
  undergraduate_application_url?: string;
  graduate_application_url?: string;
  admissions_page_url?: string;
  international_students_url?: string;
  financial_aid_url?: string;
  virtual_tour_url?: string;
  ranking?: string;
  tuition_fees?: Record<string, string> | null;
  student_population?: number;
  student_faculty_ratio?: string;
  undergrad_programs_link?: string;
  grad_programs_link?: string;
}

export interface SchoolCreateInput {
  name: string;
  type: SchoolType;
  location?: string;
  country: string;
  state?: string;
  website?: string;
  acceptance_rate?: number;
  logo_url?: string;
  cover_image_url?: string;
  undergraduate_application_url?: string;
  graduate_application_url?: string;
  admissions_page_url?: string;
  international_students_url?: string;
  financial_aid_url?: string;
  virtual_tour_url?: string;
  ranking?: string;
  tuition_fees?: Record<string, string>;
  student_population?: number;
  student_faculty_ratio?: string;
}

export interface SchoolUpdateInput extends Partial<SchoolCreateInput> {
  status?: SchoolStatus;
}

export interface SchoolMajor {
  id: string;
  school_id: string;
  major_id: string;
  program_details?: string;
  program_url?: string;
  created_at: string;
  updated_at: string;
}

export interface SchoolMajorCreateInput {
  school_id: string;
  major_id: string;
  program_details?: string;
  program_url?: string;
}

export interface SchoolMajorUpdateInput {
  program_details?: string;
  program_url?: string;
}
