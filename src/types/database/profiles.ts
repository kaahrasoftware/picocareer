import { ProfileBase } from './profile-base';
import { ProfileProfessional } from './profile-professional';
import { ProfileEducation } from './profile-education';
import { ProfileSocial } from './profile-social';
import { ProfileMentor } from './profile-mentor';

export interface Profile extends 
  ProfileBase,
  ProfileProfessional,
  ProfileEducation,
  ProfileSocial,
  ProfileMentor {
  // Include joined fields as required
  company_name?: string | null;
  school_name?: string | null;
  academic_major?: string | null;
}