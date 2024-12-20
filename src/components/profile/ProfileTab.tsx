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
import { useQueryClient } from "@tanstack/react-query";

type DegreeType = "No Degree" | "High School" | "Associate" | "Bachelor" | "Master" | "MD" | "PhD";

interface ProfileTabProps {
  profile: Profile | null;
}

export function ProfileTab({ profile }: ProfileTabProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    bio: profile?.bio || "",
    position: profile?.position || "",
    company_name: profile?.company_name || "",
    years_of_experience: profile?.years_of_experience || 0,
    skills: profile?.skills?.join(", ") || "",
    tools_used: profile?.tools_used?.join(", ") || "",
    keywords: profile?.keywords?.join(", ") || "",
    linkedin_url: profile?.linkedin_url || "",
    github_url: profile?.github_url || "",
    website_url: profile?.website_url || "",
    highest_degree: (profile?.highest_degree as DegreeType) || "No Degree",
    academic_major: profile?.academic_major || "",
    location: profile?.location || "",
  });
  const { toast } = useToast();
  const queryClient = useQueryClient();

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
          bio: formData.bio,
          position: formData.position,
          company_name: formData.company_name,
          years_of_experience: parseInt(formData.years_of_experience.toString()),
          skills: formData.skills.split(",").map(s => s.trim()).filter(Boolean),
          tools_used: formData.tools_used.split(",").map(s => s.trim()).filter(Boolean),
          keywords: formData.keywords.split(",").map(s => s.trim()).filter(Boolean),
          linkedin_url: formData.linkedin_url,
          github_url: formData.github_url,
          website_url: formData.website_url,
          highest_degree: formData.highest_degree as DegreeType,
          academic_major: formData.academic_major,
          location: formData.location,
        })
        .eq('id', profile.id);

      if (error) throw error;

      toast({
        title: "Profile updated",
        description: "Your profile has been successfully updated.",
      });
      
      // Invalidate and refetch the profile query
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
      />
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div className="space-y-6">
        <ProfileBio bio={profile.bio} />
        <ProfileLinks
          linkedin_url={profile.linkedin_url}
          github_url={profile.github_url}
          website_url={profile.website_url}
        />
        <Button 
          onClick={() => setIsEditing(true)}
          className="w-full"
        >
          Edit Profile
        </Button>
      </div>

      <div className="space-y-6">
        <ProfileEducation
          academic_major={profile.academic_major}
          highest_degree={isMentee ? null : profile.highest_degree}
        />
        {profile.location && (
          <div className="bg-muted rounded-lg p-4">
            <h4 className="font-semibold mb-2">Location</h4>
            <p className="text-muted-foreground">{profile.location}</p>
          </div>
        )}
      </div>

      <div className="space-y-6">
        {!isMentee && profile.skills && profile.skills.length > 0 && (
          <ProfileSkills
            skills={profile.skills}
            tools={profile.tools_used}
            keywords={profile.keywords}
          />
        )}
        {!isMentee && (
          <div className="bg-muted rounded-lg p-4 space-y-3">
            <h4 className="font-semibold">Professional Experience</h4>
            {profile.position && (
              <div className="text-muted-foreground">
                <span className="font-medium">Position:</span> {profile.position}
              </div>
            )}
            {profile.company_name && (
              <div className="text-muted-foreground">
                <span className="font-medium">Company:</span> {profile.company_name}
              </div>
            )}
            {profile.years_of_experience !== null && (
              <div className="text-muted-foreground">
                <span className="font-medium">Years of Experience:</span> {profile.years_of_experience}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}