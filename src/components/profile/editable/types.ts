
export type FieldName = 
  | 'career_id'
  | 'company_id' 
  | 'school_id'
  | 'academic_major_id'
  | 'industry'
  | 'department'
  | 'position';

export type TableName = 
  | 'careers'
  | 'companies'
  | 'schools'
  | 'majors'
  | 'industries'
  | 'departments'
  | 'positions';

export interface QueryResult {
  id: string;
  title?: string;
  name?: string;
  status?: string;
}
