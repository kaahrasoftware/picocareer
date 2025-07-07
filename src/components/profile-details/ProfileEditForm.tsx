
import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { PersonalInfoSection } from './form-sections/PersonalInfoSection';
import { BioSection } from './form-sections/BioSection';
import { LocationSection } from './form-sections/LocationSection';
import { SkillsSection } from './form-sections/SkillsSection';
import { LinksSection } from './form-sections/LinksSection';
import { ProfessionalSection } from './form-sections/ProfessionalSection';
import { EducationSection } from './form-sections/EducationSection';
import { AvatarSection } from './form-sections/AvatarSection';
import { CompanySelector } from './form-sections/CompanySelector';
import { SchoolSelector } from './form-sections/SchoolSelector';
import { MajorSelector } from './form-sections/MajorSelector';
import { useMentorReferenceData } from '@/hooks/mentor/useMentorReferenceData';
import type { ProfileEditFormProps, FormFields } from './types/form-types';

export function ProfileEditForm({ profile, onCancel, onSuccess }: ProfileEditFormProps) {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentDegree, setCurrentDegree] = useState(profile.highest_degree || '');
  const { companies, schools, majors } = useMentorReferenceData();

  const form = useForm<FormFields>({
    defaultValues: {
      first_name: profile.first_name || '',
      last_name: profile.last_name || '',
      bio: profile.bio || '',
      location: profile.location || '',
      years_of_experience: profile.years_of_experience || 0,
      skills: Array.isArray(profile.skills) ? profile.skills.join(', ') : '',
      tools_used: Array.isArray(profile.tools_used) ? profile.tools_used.join(', ') : '',
      keywords: Array.isArray(profile.keywords) ? profile.keywords.join(', ') : '',
      fields_of_interest: Array.isArray(profile.fields_of_interest) ? profile.fields_of_interest.join(', ') : '',
      linkedin_url: profile.linkedin_url || '',
      github_url: profile.github_url || '',
      website_url: profile.website_url || '',
      X_url: (profile as any).X_url || '',
      instagram_url: (profile as any).instagram_url || '',
      facebook_url: (profile as any).facebook_url || '',
      youtube_url: (profile as any).youtube_url || '',
      tiktok_url: (profile as any).tiktok_url || '',
      position: profile.position || '',
      company_id: profile.company_id || '',
      school_id: profile.school_id || '',
      academic_major_id: profile.academic_major_id || '',
      highest_degree: profile.highest_degree || '',
      student_nonstudent: profile.student_nonstudent || '',
    }
  });

  const handleAvatarUpdate = (url: string) => {
    // Avatar update is handled separately through the AvatarSection component
    toast({
      title: "Success",
      description: "Profile picture updated successfully",
    });
  };

  const onSubmit = async (data: FormFields) => {
    setIsSubmitting(true);
    try {
      // Transform form data for database
      const updateData = {
        first_name: data.first_name.trim(),
        last_name: data.last_name.trim(),
        bio: data.bio.trim(),
        location: data.location.trim(),
        years_of_experience: Number(data.years_of_experience),
        skills: data.skills ? data.skills.split(',').map(s => s.trim()).filter(Boolean) : [],
        tools_used: data.tools_used ? data.tools_used.split(',').map(s => s.trim()).filter(Boolean) : [],
        keywords: data.keywords ? data.keywords.split(',').map(s => s.trim()).filter(Boolean) : [],
        fields_of_interest: data.fields_of_interest ? data.fields_of_interest.split(',').map(s => s.trim()).filter(Boolean) : [],
        linkedin_url: data.linkedin_url.trim() || null,
        github_url: data.github_url.trim() || null,
        website_url: data.website_url.trim() || null,
        X_url: data.X_url.trim() || null,
        instagram_url: data.instagram_url.trim() || null,
        facebook_url: data.facebook_url.trim() || null,
        youtube_url: data.youtube_url.trim() || null,
        tiktok_url: data.tiktok_url.trim() || null,
        position: data.position.trim() || null,
        company_id: data.company_id || null,
        school_id: data.school_id || null,
        academic_major_id: data.academic_major_id || null,
        highest_degree: currentDegree as "No Degree" | "High School" | "Associate" | "Bachelor" | "Master" | "MD" | "PhD",
        student_nonstudent: data.student_nonstudent as "Student" | "Non-Student" | null,
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

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
      <AvatarSection
        avatarUrl={profile.avatar_url}
        userId={profile.id}
        onAvatarUpdate={handleAvatarUpdate}
      />

      <PersonalInfoSection form={form} />
      <BioSection form={form} />
      <LocationSection form={form} />

      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Professional Information</h3>
        <div>
          <label className="text-sm font-medium">Position</label>
          <input
            {...form.register("position")}
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
            placeholder="Your current position"
          />
        </div>

        <div>
          <label className="text-sm font-medium">Company</label>
          <CompanySelector
            value={form.watch("company_id")}
            onValueChange={(value) => form.setValue("company_id", value)}
          />
        </div>

        <div>
          <label className="text-sm font-medium">Years of Experience</label>
          <input
            {...form.register("years_of_experience")}
            type="number"
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
            min="0"
          />
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Education</h3>
        
        <div>
          <label className="text-sm font-medium">Highest Degree</label>
          <select
            value={currentDegree}
            onChange={(e) => setCurrentDegree(e.target.value)}
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
          >
            <option value="">Select degree</option>
            <option value="No Degree">No Degree</option>
            <option value="High School">High School</option>
            <option value="Associate">Associate</option>
            <option value="Bachelor">Bachelor</option>
            <option value="Master">Master</option>
            <option value="MD">MD</option>
            <option value="PhD">PhD</option>
          </select>
        </div>

        <div>
          <label className="text-sm font-medium">Academic Major</label>
          <MajorSelector
            value={form.watch("academic_major_id")}
            onValueChange={(value) => form.setValue("academic_major_id", value)}
          />
        </div>

        <div>
          <label className="text-sm font-medium">School</label>
          <SchoolSelector
            value={form.watch("school_id")}
            onValueChange={(value) => form.setValue("school_id", value)}
          />
        </div>

        <div>
          <label className="text-sm font-medium">Student Status</label>
          <select
            {...form.register("student_nonstudent")}
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
          >
            <option value="">Select status</option>
            <option value="Student">Student</option>
            <option value="Non-Student">Non-Student</option>
          </select>
        </div>
      </div>

      <SkillsSection form={form} />

      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Social Media Links</h3>
        
        <div>
          <label className="text-sm font-medium">LinkedIn URL</label>
          <input
            {...form.register("linkedin_url")}
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
            type="url"
            placeholder="https://linkedin.com/in/username"
          />
        </div>

        <div>
          <label className="text-sm font-medium">GitHub URL</label>
          <input
            {...form.register("github_url")}
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
            type="url"
            placeholder="https://github.com/username"
          />
        </div>

        <div>
          <label className="text-sm font-medium">Website URL</label>
          <input
            {...form.register("website_url")}
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
            type="url"
            placeholder="https://yourwebsite.com"
          />
        </div>

        <div>
          <label className="text-sm font-medium">X (Twitter) URL</label>
          <input
            {...form.register("X_url")}
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
            type="url"
            placeholder="https://x.com/username"
          />
        </div>

        <div>
          <label className="text-sm font-medium">Instagram URL</label>
          <input
            {...form.register("instagram_url")}
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
            type="url"
            placeholder="https://instagram.com/username"
          />
        </div>

        <div>
          <label className="text-sm font-medium">Facebook URL</label>
          <input
            {...form.register("facebook_url")}
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
            type="url"
            placeholder="https://facebook.com/username"
          />
        </div>

        <div>
          <label className="text-sm font-medium">YouTube URL</label>
          <input
            {...form.register("youtube_url")}
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
            type="url"
            placeholder="https://youtube.com/channel/username"
          />
        </div>

        <div>
          <label className="text-sm font-medium">TikTok URL</label>
          <input
            {...form.register("tiktok_url")}
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
            type="url"
            placeholder="https://tiktok.com/@username"
          />
        </div>
      </div>

      <div className="flex justify-end gap-2">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={isSubmitting}
        >
          Cancel
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Updating..." : "Update Profile"}
        </Button>
      </div>
    </form>
  );
}
