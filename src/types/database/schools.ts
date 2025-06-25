
export interface School {
  id: string;
  name: string;
  type: SchoolType;
  country: string;
  state: string;
  location: string;
  website: string;
  acceptance_rate: number;
  student_population: number;
  student_faculty_ratio: string | null;
  ranking: string | null;
  tuition_fees: any; // JSONB field for structured tuition data
  cover_image_url?: string;
  logo_url?: string;
  undergraduate_application_url: string | null;
  graduate_application_url: string | null;
  admissions_page_url: string | null;
  international_students_url: string | null;
  financial_aid_url: string | null;
  virtual_tour_url?: string;
  undergrad_programs_link: string | null;
  grad_programs_link: string | null;
  created_at: string;
  updated_at: string;
  status: SchoolStatus;
  author_id: string;
  featured?: boolean;
  featured_priority?: number;
}

export type SchoolStatus = "Approved" | "Pending" | "Rejected";

export type SchoolType = 
  | "Public University"
  | "Private University" 
  | "Community College"
  | "Technical School"
  | "Liberal Arts College"
  | "Research University"
  | "Online University"
  | "For-Profit College"
  | "Military Academy"
  | "Art School"
  | "Music School"
  | "Business School"
  | "Medical School"
  | "Law School"
  | "Other";
