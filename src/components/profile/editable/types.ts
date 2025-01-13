export type TableName = 'schools' | 'majors' | 'careers' | 'companies';
export type FieldName = 'school_id' | 'academic_major_id' | 'position' | 'company_id';
export type TitleField = 'name' | 'title';
export type Status = 'Pending' | 'Approved' | 'Rejected';

export type InsertData = {
  schools: {
    name: string;
    status: Status;
  };
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
  companies: {
    name: string;
    status: Status;
  };
};