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
  // Include joined fields as required
  company_name?: string | null;
  school_name?: string | null;
  academic_major?: string | null;
  languages?: string[] | null;
  X_url?: string | null;
  facebook_url?: string | null;
  tiktok_url?: string | null;
  youtube_url?: string | null;
  instagram_url?: string | null;
}