import type { Career } from './careers';

export interface ProfileCareer {
  career?: Pick<Career, 'id' | 'title'> | null;
}