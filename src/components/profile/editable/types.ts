export interface QueryResult {
  id: string;
  title: string;
  [key: string]: any;
}

export interface InsertData {
  title: string;
  [key: string]: any;
}

export type Status = 'Pending' | 'Approved' | 'Rejected';