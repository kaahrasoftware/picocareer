import { useState, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import type { Profile } from '@/types/database/profiles';

interface ProfileUpdateData {
  first_name?: string;
  last_name?: string;
  bio?: string;
  location?: string;
  avatar_url?: string;
  years_of_experience?: number;
  skills?: string[];
  tools_used?: string[];
  keywords?: string[];
  fields_of_interest?: string[];
  linkedin_url?: string | null;
  github_url?: string | null;
  website_url?: string | null;
  X_url?: string | null;
  instagram_url?: string | null;
  facebook_url?: string | null;
  youtube_url?: string | null;
  tiktok_url?: string | null;
  position?: string | null;
  company_id?: string | null;
  school_id?: string | null;
  academic_major_id?: string | null;
  highest_degree?: "No Degree" | "High School" | "Associate" | "Bachelor" | "Master" | "MD" | "PhD";
  student_nonstudent?: "Student" | "Non-Student" | null;
}

export function useProfileManager(profile: Profile) {
  const [isUpdating, setIsUpdating] = useState(false);
  const [optimisticProfile, setOptimisticProfile] = useState<Profile>(profile);
  const { toast } = useToast();

  const updateProfile = useCallback(async (updateData: ProfileUpdateData) => {
    setIsUpdating(true);
    
    // Optimistic update
    const previousProfile = optimisticProfile;
    setOptimisticProfile(prev => ({ ...prev, ...updateData }));

    try {
      const { error } = await supabase
        .from('profiles')
        .update(updateData)
        .eq('id', profile.id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Profile updated successfully",
      });

      return { success: true };
    } catch (error: any) {
      // Revert optimistic update on error
      setOptimisticProfile(previousProfile);
      
      toast({
        title: "Error",
        description: error.message || "Failed to update profile",
        variant: "destructive",
      });

      return { success: false, error: error.message };
    } finally {
      setIsUpdating(false);
    }
  }, [profile.id, optimisticProfile, toast]);

  const updateAvatar = useCallback(async (avatarUrl: string) => {
    return updateProfile({ avatar_url: avatarUrl });
  }, [updateProfile]);

  const updatePersonalInfo = useCallback(async (data: {
    first_name: string;
    last_name: string;
    bio?: string;
    location?: string;
  }) => {
    return updateProfile(data);
  }, [updateProfile]);

  const updateProfessionalInfo = useCallback(async (data: {
    position?: string;
    company_id?: string;
    years_of_experience?: number;
    skills?: string[];
    tools_used?: string[];
    keywords?: string[];
    fields_of_interest?: string[];
  }) => {
    return updateProfile(data);
  }, [updateProfile]);

  const updateEducationInfo = useCallback(async (data: {
    highest_degree?: "No Degree" | "High School" | "Associate" | "Bachelor" | "Master" | "MD" | "PhD";
    school_id?: string;
    academic_major_id?: string;
    student_nonstudent?: "Student" | "Non-Student" | null;
  }) => {
    return updateProfile(data);
  }, [updateProfile]);

  const updateSocialLinks = useCallback(async (data: {
    linkedin_url?: string | null;
    github_url?: string | null;
    website_url?: string | null;
    X_url?: string | null;
    instagram_url?: string | null;
    facebook_url?: string | null;
    youtube_url?: string | null;
    tiktok_url?: string | null;
  }) => {
    return updateProfile(data);
  }, [updateProfile]);

  return {
    profile: optimisticProfile,
    isUpdating,
    updateProfile,
    updateAvatar,
    updatePersonalInfo,
    updateProfessionalInfo,
    updateEducationInfo,
    updateSocialLinks,
  };
}