
export interface ScholarshipFilters {
  search?: string;
  category?: string;
  amount?: string;
  status?: string;
  deadline?: Date;
  citizenship?: string[];
  demographic?: string[];
  academic_year?: string[];
  major?: string[];
  gpa_requirement?: string;
  renewable?: boolean;
  award_frequency?: string;
  application_process_length?: string;
}
