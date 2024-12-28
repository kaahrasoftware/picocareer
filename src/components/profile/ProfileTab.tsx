import React from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useUserProfile } from "@/hooks/useUserProfile";
import { useToast } from "@/hooks/use-toast";
import { ProfileEditForm } from "@/components/profile-details/ProfileEditForm";
import { useSession } from "@supabase/auth-helpers-react";

export function ProfileTab() {
  const session = useSession();
  const { data: profile, isLoading } = useUserProfile(session);
  const { toast } = useToast();

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

  const handleInputChange = async (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    if (!profile?.id) return;

    try {
      const { error } = await supabase
        .from('profiles')
        .update({ [name]: value })
        .eq('id', profile.id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Profile updated successfully",
      });
    } catch (error) {
      console.error('Error updating profile:', error);
      toast({
        title: "Error",
        description: "Failed to update profile",
        variant: "destructive",
      });
    }
  };

  const handleSelectChange = async (name: string, value: string) => {
    if (!profile?.id) return;

    try {
      const { error } = await supabase
        .from('profiles')
        .update({ [name]: value })
        .eq('id', profile.id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Profile updated successfully",
      });
    } catch (error) {
      console.error('Error updating profile:', error);
      toast({
        title: "Error",
        description: "Failed to update profile",
        variant: "destructive",
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // The form is auto-saving, so we don't need to do anything here
    toast({
      title: "Success",
      description: "All changes have been saved",
    });
  };

  if (isLoading || !profile) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
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
        handleInputChange={handleInputChange}
        handleSelectChange={handleSelectChange}
        handleSubmit={handleSubmit}
        setIsEditing={() => {}} // Not needed anymore since we're always in edit mode
        isMentee={profile?.user_type === 'mentee'}
        majors={majors || []}
        companies={companies || []}
        schools={schools || []}
      />
    </div>
  );
}