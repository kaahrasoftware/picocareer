import React from "react";
import { ProfileEditForm } from "../profile-details/ProfileEditForm";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useUserProfile } from "@/hooks/useUserProfile";

export function ProfileTab() {
  const { profile, isLoading: profileLoading } = useUserProfile();
  
  // Fetch majors data
  const { data: majors } = useQuery({
    queryKey: ['majors'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('majors')
        .select('id, title')
        .eq('status', 'Approved')
        .order('title');
      
      if (error) throw error;
      return data || [];
    }
  });

  // Fetch companies data
  const { data: companies } = useQuery({
    queryKey: ['companies'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('companies')
        .select('id, name')
        .eq('status', 'Approved')
        .order('name');
      
      if (error) throw error;
      return data || [];
    }
  });

  // Fetch schools data
  const { data: schools } = useQuery({
    queryKey: ['schools'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('schools')
        .select('id, name')
        .eq('status', 'Approved')
        .order('name');
      
      if (error) throw error;
      return data || [];
    }
  });

  if (profileLoading || !profile) {
    return <div>Loading...</div>;
  }

  const formData = {
    first_name: profile.first_name || '',
    last_name: profile.last_name || '',
    bio: profile.bio || '',
    position: profile.position || '',
    company_id: profile.company_id || '',
    school_id: profile.school_id || '',
    years_of_experience: profile.years_of_experience || 0,
    skills: profile.skills?.join(', ') || '',
    tools_used: profile.tools_used?.join(', ') || '',
    keywords: profile.keywords?.join(', ') || '',
    fields_of_interest: profile.fields_of_interest?.join(', ') || '',
    linkedin_url: profile.linkedin_url || '',
    github_url: profile.github_url || '',
    website_url: profile.website_url || '',
    highest_degree: profile.highest_degree || 'No Degree',
    academic_major_id: profile.academic_major_id || '',
    location: profile.location || '',
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <ProfileEditForm
        formData={formData}
        handleInputChange={() => {}}
        handleSelectChange={() => {}}
        handleSubmit={() => {}}
        setIsEditing={() => {}}
        isMentee={profile.user_type === 'mentee'}
        majors={majors || []}
        companies={companies || []}
        schools={schools || []}
      />
    </div>
  );
}