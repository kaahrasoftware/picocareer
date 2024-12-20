import React, { useState } from "react";
import { ProfileBio } from "@/components/profile-details/ProfileBio";
import { ProfileEducation } from "@/components/profile-details/ProfileEducation";
import { ProfileLinks } from "@/components/profile-details/ProfileLinks";
import { ProfileSkills } from "@/components/profile-details/ProfileSkills";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import type { Profile } from "@/types/database/profiles";

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
  });
  const { toast } = useToast();

  if (!profile) return null;
  
  const isMentee = profile.user_type === 'mentee';

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
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
          years_of_experience: parseInt(formData.years_of_experience.toString()),
          skills: formData.skills.split(",").map(s => s.trim()).filter(Boolean),
          tools_used: formData.tools_used.split(",").map(s => s.trim()).filter(Boolean),
          keywords: formData.keywords.split(",").map(s => s.trim()).filter(Boolean),
          linkedin_url: formData.linkedin_url,
          github_url: formData.github_url,
          website_url: formData.website_url,
        })
        .eq('id', profile.id);

      if (error) throw error;

      toast({
        title: "Profile updated",
        description: "Your profile has been successfully updated.",
      });
      
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
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium">Bio</label>
            <Textarea
              name="bio"
              value={formData.bio}
              onChange={handleInputChange}
              className="mt-1"
            />
          </div>

          {!isMentee && (
            <>
              <div>
                <label className="text-sm font-medium">Position</label>
                <Input
                  name="position"
                  value={formData.position}
                  onChange={handleInputChange}
                  className="mt-1"
                />
              </div>

              <div>
                <label className="text-sm font-medium">Years of Experience</label>
                <Input
                  name="years_of_experience"
                  type="number"
                  value={formData.years_of_experience}
                  onChange={handleInputChange}
                  className="mt-1"
                />
              </div>

              <div>
                <label className="text-sm font-medium">Skills (comma-separated)</label>
                <Input
                  name="skills"
                  value={formData.skills}
                  onChange={handleInputChange}
                  className="mt-1"
                  placeholder="React, TypeScript, Node.js"
                />
              </div>

              <div>
                <label className="text-sm font-medium">Tools (comma-separated)</label>
                <Input
                  name="tools_used"
                  value={formData.tools_used}
                  onChange={handleInputChange}
                  className="mt-1"
                  placeholder="VS Code, Git, Docker"
                />
              </div>

              <div>
                <label className="text-sm font-medium">Keywords (comma-separated)</label>
                <Input
                  name="keywords"
                  value={formData.keywords}
                  onChange={handleInputChange}
                  className="mt-1"
                  placeholder="web development, backend, frontend"
                />
              </div>
            </>
          )}

          <div>
            <label className="text-sm font-medium">LinkedIn URL</label>
            <Input
              name="linkedin_url"
              value={formData.linkedin_url}
              onChange={handleInputChange}
              className="mt-1"
              type="url"
            />
          </div>

          <div>
            <label className="text-sm font-medium">GitHub URL</label>
            <Input
              name="github_url"
              value={formData.github_url}
              onChange={handleInputChange}
              className="mt-1"
              type="url"
            />
          </div>

          <div>
            <label className="text-sm font-medium">Website URL</label>
            <Input
              name="website_url"
              value={formData.website_url}
              onChange={handleInputChange}
              className="mt-1"
              type="url"
            />
          </div>
        </div>

        <div className="flex gap-4">
          <Button type="submit">Save Changes</Button>
          <Button 
            type="button" 
            variant="outline" 
            onClick={() => setIsEditing(false)}
          >
            Cancel
          </Button>
        </div>
      </form>
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
        <Button onClick={() => setIsEditing(true)}>Edit Profile</Button>
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