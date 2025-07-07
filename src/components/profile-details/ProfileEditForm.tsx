
import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ProfileEditFormProps, FormFields } from "./types/form-types";
import { degreeOptions } from "@/constants/degrees";
import { CompanySelector } from "./form-sections/CompanySelector";
import { SchoolSelector } from "./form-sections/SchoolSelector";
import { MajorSelector } from "./form-sections/MajorSelector";
import { AvatarSection } from "./form-sections/AvatarSection";

export function ProfileEditForm({ profile, onCancel, onSuccess }: ProfileEditFormProps) {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState(profile.avatar_url || '');

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch
  } = useForm<FormFields>({
    defaultValues: {
      first_name: profile.first_name || '',
      last_name: profile.last_name || '',
      bio: profile.bio || '',
      location: profile.location || '',
      years_of_experience: profile.years_of_experience || 0,
      skills: profile.skills?.join(', ') || '',
      tools_used: profile.tools_used?.join(', ') || '',
      keywords: profile.keywords?.join(', ') || '',
      fields_of_interest: profile.fields_of_interest?.join(', ') || '',
      linkedin_url: profile.linkedin_url || '',
      github_url: profile.github_url || '',
      website_url: profile.website_url || '',
      X_url: profile.X_url || '',
      instagram_url: profile.instagram_url || '',
      facebook_url: profile.facebook_url || '',
      youtube_url: profile.youtube_url || '',
      tiktok_url: profile.tiktok_url || '',
      position: profile.position || '',
      company_id: profile.company_id || '',
      school_id: profile.school_id || '',
      academic_major_id: profile.academic_major_id || '',
      highest_degree: profile.highest_degree || '',
      student_nonstudent: profile.student_nonstudent || '',
    }
  });

  const watchedDegree = watch("highest_degree");

  const onSubmit = async (data: FormFields) => {
    setIsSubmitting(true);
    try {
      // Convert comma-separated strings back to arrays
      const updateData = {
        first_name: data.first_name,
        last_name: data.last_name,
        bio: data.bio,
        location: data.location,
        years_of_experience: data.years_of_experience,
        skills: data.skills ? data.skills.split(',').map(s => s.trim()).filter(s => s) : [],
        tools_used: data.tools_used ? data.tools_used.split(',').map(s => s.trim()).filter(s => s) : [],
        keywords: data.keywords ? data.keywords.split(',').map(s => s.trim()).filter(s => s) : [],
        fields_of_interest: data.fields_of_interest ? data.fields_of_interest.split(',').map(s => s.trim()).filter(s => s) : [],
        linkedin_url: data.linkedin_url,
        github_url: data.github_url,
        website_url: data.website_url,
        X_url: data.X_url,
        instagram_url: data.instagram_url,
        facebook_url: data.facebook_url,
        youtube_url: data.youtube_url,
        tiktok_url: data.tiktok_url,
        position: data.position,
        company_id: data.company_id || null,
        school_id: data.school_id || null,
        academic_major_id: data.academic_major_id || null,
        student_nonstudent: data.student_nonstudent || null,
        avatar_url: avatarUrl,
        // Ensure highest_degree is properly typed as one of the allowed values
        highest_degree: data.highest_degree as "No Degree" | "High School" | "Associate" | "Bachelor" | "Master" | "MD" | "PhD",
      };

      const { error } = await supabase
        .from('profiles')
        .update(updateData)
        .eq('id', profile.id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Profile updated successfully",
      });

      onSuccess?.();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to update profile",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAvatarUpdate = (url: string) => {
    setAvatarUrl(url);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Avatar Section */}
      <div className="bg-muted rounded-lg p-4">
        <AvatarSection
          avatarUrl={avatarUrl}
          userId={profile.id}
          onAvatarUpdate={handleAvatarUpdate}
        />
      </div>

      {/* Personal Information */}
      <div className="bg-muted rounded-lg p-4 space-y-4">
        <h4 className="font-semibold">Personal Information</h4>
        
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="first_name">First Name</Label>
            <Input
              id="first_name"
              {...register("first_name", { required: "First name is required" })}
            />
            {errors.first_name && (
              <p className="text-sm text-destructive mt-1">{errors.first_name.message}</p>
            )}
          </div>
          
          <div>
            <Label htmlFor="last_name">Last Name</Label>
            <Input
              id="last_name"
              {...register("last_name", { required: "Last name is required" })}
            />
            {errors.last_name && (
              <p className="text-sm text-destructive mt-1">{errors.last_name.message}</p>
            )}
          </div>
        </div>

        <div>
          <Label htmlFor="bio">Bio</Label>
          <Textarea
            id="bio"
            {...register("bio")}
            placeholder="Tell us about yourself..."
            className="min-h-[100px]"
          />
        </div>

        <div>
          <Label htmlFor="location">Location</Label>
          <Input
            id="location"
            {...register("location")}
            placeholder="City, Country"
          />
        </div>

        <div>
          <Label htmlFor="years_of_experience">Years of Experience</Label>
          <Input
            id="years_of_experience"
            type="number"
            min="0"
            {...register("years_of_experience", { valueAsNumber: true })}
          />
        </div>
      </div>

      {/* Skills & Interests */}
      <div className="bg-muted rounded-lg p-4 space-y-4">
        <h4 className="font-semibold">Skills & Interests</h4>
        
        <div>
          <Label htmlFor="skills">Skills (comma-separated)</Label>
          <Input
            id="skills"
            {...register("skills")}
            placeholder="React, JavaScript, Python, etc."
          />
        </div>

        <div>
          <Label htmlFor="tools_used">Tools Used (comma-separated)</Label>
          <Input
            id="tools_used"
            {...register("tools_used")}
            placeholder="VS Code, Git, Docker, etc."
          />
        </div>

        <div>
          <Label htmlFor="fields_of_interest">Fields of Interest (comma-separated)</Label>
          <Input
            id="fields_of_interest"
            {...register("fields_of_interest")}
            placeholder="Software Development, Data Science, etc."
          />
        </div>

        <div>
          <Label htmlFor="keywords">Keywords (comma-separated)</Label>
          <Input
            id="keywords"
            {...register("keywords")}
            placeholder="Technology, Innovation, etc."
          />
        </div>
      </div>

      {/* Professional Information */}
      <div className="bg-muted rounded-lg p-4 space-y-4">
        <h4 className="font-semibold">Professional Information</h4>
        
        <div>
          <Label htmlFor="position">Position</Label>
          <Input
            id="position"
            {...register("position")}
            placeholder="Software Engineer, Designer, etc."
          />
        </div>

        <div>
          <Label>Company</Label>
          <CompanySelector
            value={watch("company_id")}
            onValueChange={(value) => setValue("company_id", value)}
          />
        </div>
      </div>

      {/* Education Information */}
      <div className="bg-muted rounded-lg p-4 space-y-4">
        <h4 className="font-semibold">Education Information</h4>
        
        <div>
          <Label htmlFor="highest_degree">Highest Degree</Label>
          <Select 
            value={watchedDegree} 
            onValueChange={(value) => setValue("highest_degree", value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select your highest degree" />
            </SelectTrigger>
            <SelectContent>
              {degreeOptions.map((degree) => (
                <SelectItem key={degree} value={degree}>
                  {degree}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label>School</Label>
          <SchoolSelector
            value={watch("school_id")}
            onValueChange={(value) => setValue("school_id", value)}
          />
        </div>

        <div>
          <Label>Academic Major</Label>
          <MajorSelector
            value={watch("academic_major_id")}
            onValueChange={(value) => setValue("academic_major_id", value)}
          />
        </div>

        <div>
          <Label htmlFor="student_nonstudent">Student Status</Label>
          <Select 
            value={watch("student_nonstudent")} 
            onValueChange={(value) => setValue("student_nonstudent", value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select your status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Student">Student</SelectItem>
              <SelectItem value="Non-Student">Non-Student</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Social Links */}
      <div className="bg-muted rounded-lg p-4 space-y-4">
        <h4 className="font-semibold">Social Links</h4>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="linkedin_url">LinkedIn URL</Label>
            <Input
              id="linkedin_url"
              type="url"
              {...register("linkedin_url")}
              placeholder="https://linkedin.com/in/yourprofile"
            />
          </div>

          <div>
            <Label htmlFor="github_url">GitHub URL</Label>
            <Input
              id="github_url"
              type="url"
              {...register("github_url")}
              placeholder="https://github.com/yourusername"
            />
          </div>

          <div>
            <Label htmlFor="website_url">Website URL</Label>
            <Input
              id="website_url"
              type="url"
              {...register("website_url")}
              placeholder="https://yourwebsite.com"
            />
          </div>

          <div>
            <Label htmlFor="X_url">X (Twitter) URL</Label>
            <Input
              id="X_url"
              type="url"
              {...register("X_url")}
              placeholder="https://x.com/yourusername"
            />
          </div>

          <div>
            <Label htmlFor="instagram_url">Instagram URL</Label>
            <Input
              id="instagram_url"
              type="url"
              {...register("instagram_url")}
              placeholder="https://instagram.com/yourusername"
            />
          </div>

          <div>
            <Label htmlFor="facebook_url">Facebook URL</Label>
            <Input
              id="facebook_url"
              type="url"
              {...register("facebook_url")}
              placeholder="https://facebook.com/yourprofile"
            />
          </div>

          <div>
            <Label htmlFor="youtube_url">YouTube URL</Label>
            <Input
              id="youtube_url"
              type="url"
              {...register("youtube_url")}
              placeholder="https://youtube.com/@yourchannel"
            />
          </div>

          <div>
            <Label htmlFor="tiktok_url">TikTok URL</Label>
            <Input
              id="tiktok_url"
              type="url"
              {...register("tiktok_url")}
              placeholder="https://tiktok.com/@yourusername"
            />
          </div>
        </div>
      </div>

      {/* Form Actions */}
      <div className="flex justify-end gap-2 pt-4">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={isSubmitting}
        >
          Cancel
        </Button>
        <Button
          type="submit"
          disabled={isSubmitting}
        >
          {isSubmitting ? "Saving..." : "Save Changes"}
        </Button>
      </div>
    </form>
  );
}
