
export interface School {
  id: string;
  name: string;
  type: SchoolType;
  country: string;
  state: string;
  city: string;
  location: string;
  website: string;
  email: string;
  phone: string;
  established_year: number;
  student_population: number;
  acceptance_rate: number;
  tuition_in_state: number;
  tuition_out_of_state: number;
  tuition_international: number;
  room_and_board: number;
  application_fee: number;
  application_deadline: string;
  sat_range_low: number;
  sat_range_high: number;
  act_range_low: number;
  act_range_high: number;
  gpa_average: number;
  description: string;
  campus_size: string;
  programs_offered: string[];
  notable_alumni: string[];
  rankings: any;
  ranking: string | null;
  admissions_requirements: string[];
  financial_aid_available: boolean;
  scholarship_opportunities: string[];
  campus_facilities: string[];
  student_organizations: string[];
  sports_programs: string[];
  research_opportunities: boolean;
  internship_programs: boolean;
  study_abroad_programs: boolean;
  diversity_stats: any;
  graduation_rate: number;
  employment_rate: number;
  average_salary_after_graduation: number;
  notable_programs: string[];
  campus_culture: string;
  location_benefits: string[];
  housing_options: string[];
  dining_options: string[];
  transportation: string[];
  safety_measures: string[];
  sustainability_initiatives: string[];
  technology_resources: string[];
  library_resources: string[];
  health_services: string[];
  counseling_services: string[];
  career_services: string[];
  alumni_network_strength: string;
  partnerships_with_industry: string[];
  accreditation: string[];
  special_programs: string[];
  language_programs: string[];
  online_programs_available: boolean;
  part_time_programs_available: boolean;
  evening_programs_available: boolean;
  weekend_programs_available: boolean;
  summer_programs_available: boolean;
  continuing_education_programs: boolean;
  professional_development_programs: boolean;
  student_faculty_ratio: string | null;
  undergraduate_application_url: string | null;
  graduate_application_url: string | null;
  international_students_url: string | null;
  financial_aid_url: string | null;
  created_at: string;
  updated_at: string;
  status: SchoolStatus;
  author_id: string;
  featured?: boolean;
  featured_priority?: number;
  cover_image_url?: string;
  logo_url?: string;
  virtual_tour_url?: string;
  application_portal_url?: string;
  admissions_page_url?: string;
  financial_aid_page_url?: string;
  campus_map_url?: string;
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
