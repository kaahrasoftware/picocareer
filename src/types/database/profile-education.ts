import type { Degree } from './enums';

export interface ProfileEducation {
  school_id?: string | null;
  highest_degree?: Degree | null;
  academic_major_id?: string | null;
}