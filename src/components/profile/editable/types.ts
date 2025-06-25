
export type FieldName = 'academic_major_id' | 'school_id' | 'position' | 'company_id';
export type TableName = 'majors' | 'schools' | 'careers' | 'companies';
export type TitleField = 'title' | 'name';

export interface QueryResult {
  id: string;
  title?: string;
  name?: string;
}
