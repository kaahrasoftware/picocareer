import { ProfileBase } from './profile-base';
import { ProfileProfessional } from './profile-professional';
import { ProfileEducation } from './profile-education';
import { ProfileSocial } from './profile-social';
import { ProfileMentor } from './profile-mentor';
import { ProfileCareer } from './profile-career';

export interface Profile extends 
  ProfileBase,
  ProfileProfessional,
  ProfileEducation,
  ProfileSocial,
  ProfileMentor,
  ProfileCareer {
  // Derived fields from joins
  academic_major?: string | null;
  school_name?: string | null;
  company_name?: string | null;
  career_title?: string | null;
}