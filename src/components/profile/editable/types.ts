
export type TableName = 'majors' | 'schools' | 'companies' | 'careers';
export type FieldName = 'academic_major_id' | 'school_id' | 'company_id' | 'position' | 'highest_degree';
export type TitleField = 'title' | 'name';
export type Status = 'Approved' | 'Pending' | 'Rejected';

export interface QueryResult {
  id: string;
  title?: string;
  name?: string;
}

export interface InsertData {
  majors: {
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
  careers: {
    title: string;
    description: string;
    status: Status;
  };
}
