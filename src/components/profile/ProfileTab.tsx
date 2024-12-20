import React, { useState } from "react";
import { ProfileBio } from "@/components/profile-details/ProfileBio";
import { ProfileEducation } from "@/components/profile-details/ProfileEducation";
import { ProfileLinks } from "@/components/profile-details/ProfileLinks";
import { ProfileSkills } from "@/components/profile-details/ProfileSkills";
import { ProfileEditForm } from "@/components/profile-details/ProfileEditForm";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import type { Profile } from "@/types/database/profiles";
import { useQueryClient, useQuery } from "@tanstack/react-query";
import type { Database } from "@/integrations/supabase/types";

type DegreeType = Database['public']['Enums']['degree'];

interface ProfileTabProps {
  profile: Profile | null;
}

export function ProfileTab({ profile }: ProfileTabProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    first_name: profile?.first_name || "",
    last_name: profile?.last_name || "",
    bio: profile?.bio || "",
    position: profile?.position || "",
    company_id: profile?.company_id || "",
    school_id: profile?.school_id || "",
    years_of_experience: profile?.years_of_experience || 0,
    skills: profile?.skills?.join(", ") || "",
    tools_used: profile?.tools_used?.join(", ") || "",
    keywords: profile?.keywords?.join(", ") || "",
    fields_of_interest: profile?.fields_of_interest?.join(", ") || "",
    linkedin_url: profile?.linkedin_url || "",
    github_url: profile?.github_url || "",
    website_url: profile?.website_url || "",
    highest_degree: (profile?.highest_degree as DegreeType) || "No Degree",
    academic_major_id: profile?.academic_major_id || "",
    location: profile?.location || "",
  });

  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch all majors
  const { data: majors } = useQuery({
    queryKey: ['majors'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('majors')
        .select('id, title')
        .order('title');
      
      if (error) throw error;
      return data;
    }
  });

  // Fetch all companies
  const { data: companies } = useQuery({
    queryKey: ['companies'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('companies')
        .select('id, name')
        .order('name');
      
      if (error) throw error;
      return data;
    }
  });

  // Fetch all schools
  const { data: schools } = useQuery({
    queryKey: ['schools'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('schools')
        .select('id, name')
        .order('name');
      
      if (error) throw error;
      return data;
    }
  });

  if (!profile) return null;
  
  const isMentee = profile.user_type === 'mentee';

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          first_name: formData.first_name,
          last_name: formData.last_name,
          bio: formData.bio,
          position: formData.position,
          company_id: formData.company_id || null,
          school_id: formData.school_id || null,
          years_of_experience: parseInt(formData.years_of_experience.toString()),
          skills: formData.skills.split(",").map(s => s.trim()).filter(Boolean),
          tools_used: formData.tools_used.split(",").map(s => s.trim()).filter(Boolean),
          keywords: formData.keywords.split(",").map(s => s.trim()).filter(Boolean),
          fields_of_interest: formData.fields_of_interest.split(",").map(s => s.trim()).filter(Boolean),
          linkedin_url: formData.linkedin_url,
          github_url: formData.github_url,
          website_url: formData.website_url,
          highest_degree: formData.highest_degree as DegreeType,
          academic_major_id: formData.academic_major_id,
          location: formData.location,
        })
        .eq('id', profile.id);

      if (error) throw error;

      toast({
        title: "Profile updated",
        description: "Your profile has been successfully updated.",
      });
      
      await queryClient.invalidateQueries({ queryKey: ['profile'] });
      
      setIsEditing(false);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update profile. Please try again.",
        variant: "destructive",
      });
    }
  };

  if (isEditing) {
    return (
      <ProfileEditForm
        formData={formData}
        handleInputChange={handleInputChange}
        handleSelectChange={handleSelectChange}
        handleSubmit={handleSubmit}
        setIsEditing={setIsEditing}
        isMentee={isMentee}
        majors={majors || []}
        companies={companies || []}
        schools={schools || []}
      />
    );
  }

  return (
    <div className="flex flex-col space-y-6 max-w-3xl mx-auto">
      <div className="space-y-6">
        {/* Personal Information */}
        <div className="bg-muted rounded-lg p-4">
          <h4 className="font-semibold mb-2">Personal Information</h4>
          <div className="grid grid-cols-2 gap-4">
            <p className="text-muted-foreground">
              <span className="font-medium">First Name:</span> {profile?.first_name}
            </p>
            <p className="text-muted-foreground">
              <span className="font-medium">Last Name:</span> {profile?.last_name}
            </p>
          </div>
        </div>

        <ProfileBio bio={profile?.bio} />
        
        <ProfileEducation 
          academic_major={profile?.academic_major}
          highest_degree={profile?.highest_degree}
          school_name={profile?.school_name}
        />

        {profile?.location && (
          <div className="bg-muted rounded-lg p-4">
            <h4 className="font-semibold mb-2">Location</h4>
            <p className="text-muted-foreground">{profile.location}</p>
          </div>
        )}

        {!isMentee && (
          <div className="bg-muted rounded-lg p-4 space-y-3">
            <h4 className="font-semibold">Professional Experience</h4>
            {profile?.position && (
              <div className="text-muted-foreground">
                <span className="font-medium">Position:</span> {profile.position}
              </div>
            )}
            {profile?.company_name && (
              <div className="text-muted-foreground">
                <span className="font-medium">Company:</span> {profile.company_name}
              </div>
            )}
            {profile?.years_of_experience !== null && (
              <div className="text-muted-foreground">
                <span className="font-medium">Years of Experience:</span> {profile.years_of_experience}
              </div>
            )}
          </div>
        )}

        {!isMentee && profile?.skills && profile?.skills.length > 0 && (
          <ProfileSkills
            skills={profile.skills}
            tools={profile.tools_used}
            keywords={profile.keywords}
            fieldsOfInterest={profile.fields_of_interest}
          />
        )}

        <ProfileLinks
          linkedin_url={profile?.linkedin_url}
          github_url={profile?.github_url}
          website_url={profile?.website_url}
        />

        <Button 
          onClick={() => setIsEditing(true)}
          className="w-full"
        >
          Edit Profile
        </Button>
      </div>
    </div>
  );
}