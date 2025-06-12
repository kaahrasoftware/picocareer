
export type BookmarkType = 
  | 'career' 
  | 'major' 
  | 'mentor' 
  | 'scholarship' 
  | 'opportunity';

export interface BookmarkedEntity {
  id: string;
  title?: string;
  name?: string;
  description?: string;
  [key: string]: any;
}
