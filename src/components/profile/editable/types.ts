
// Create a types file to fix the SelectWithCustomOption related errors
export type TableName = 'majors' | 'schools' | 'companies' | 'careers';
export type FieldName = 'academic_major_id' | 'school_id' | 'company_id' | 'position';
export type TitleField = 'title' | 'name';
export type Status = 'Pending' | 'Approved' | 'Rejected';

export interface InsertData {
  majors: {
    title: string;
    description: string;
    status: Status;
  };
  careers: {
    title: string;
    description: string;
    status: Status;
  };
  schools: {
    name: string;
    status: Status;
  };
  companies: {
    name: string;
    status: Status;
  };
}
