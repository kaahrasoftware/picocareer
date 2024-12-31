import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import type { Profile } from "@/types/database/profiles";
import { useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { PersonalSection } from "./form-sections/PersonalSection";
import { ProfessionalSection } from "./form-sections/ProfessionalSection";
import { EducationSection } from "./form-sections/EducationSection";
import { FormFields } from "./types";

interface ProfileEditFormProps {
  profile: Profile & {
    company_name?: string | null;
    school_name?: string | null;
    academic_major?: string | null;
    career_title?: string | null;
  };
  onCancel: () => void;
  onSuccess: () => void;
}

export function ProfileEditForm({ profile, onCancel, onSuccess }: ProfileEditFormProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [localProfile, setLocalProfile] = useState(profile);
  const isMentor = profile.user_type === 'mentor';
  
  const { register, handleSubmit, formState: { isSubmitting }, watch, setValue } = useForm<FormFields>({
    defaultValues: {
      first_name: profile.first_name || "",
      last_name: profile.last_name || "",
      bio: profile.bio || "",
      years_of_experience: profile.years_of_experience || 0,
      location: profile.location || "",
      skills: profile.skills?.join(", ") || "",
      tools_used: profile.tools_used?.join(", ") || "",
      keywords: profile.keywords?.join(", ") || "",
      fields_of_interest: profile.fields_of_interest?.join(", ") || "",
      linkedin_url: profile.linkedin_url || "",
      github_url: profile.github_url || "",
      website_url: profile.website_url || "",
      position: profile.position || "",
      company_id: profile.company_id || "",
      school_id: profile.school_id || "",
      academic_major_id: profile.academic_major_id || "",
      highest_degree: (profile.highest_degree as string) || "No Degree",
    }
  });

  const handleFieldChange = (fieldName: keyof FormFields, value: any) => {
    setLocalProfile(prev => ({
      ...prev,
      [fieldName]: value
    }));
    setValue(fieldName, value);
  };

  const onSubmit = async (data: FormFields) => {
    try {
      const formattedData = {
        ...data,
        skills: data.skills ? data.skills.split(",").map((s: string) => s.trim()) : [],
        tools_used: data.tools_used ? data.tools_used.split(",").map((t: string) => t.trim()) : [],
        keywords: data.keywords ? data.keywords.split(",").map((k: string) => k.trim()) : [],
        fields_of_interest: data.fields_of_interest ? data.fields_of_interest.split(",").map((f: string) => f.trim()) : [],
      };

      const { error } = await supabase
        .from('profiles')
        .update(formattedData)
        .eq('id', profile.id);

      if (error) throw error;

      await queryClient.invalidateQueries({ queryKey: ['profile', profile.id] });
      
      toast({
        title: "Success",
        description: "Profile updated successfully",
      });
      
      onSuccess();
    } catch (error) {
      console.error('Error updating profile:', error);
      toast({
        title: "Error",
        description: "Failed to update profile",
        variant: "destructive",
      });
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 pb-6">
      <PersonalSection 
        register={register}
        handleFieldChange={handleFieldChange}
      />

      <ProfessionalSection 
        register={register}
        watch={watch}
        handleFieldChange={handleFieldChange}
        isMentor={isMentor}
      />

      <EducationSection 
        watch={watch}
        handleFieldChange={handleFieldChange}
        isMentor={isMentor}
      />

      <div className="bg-muted rounded-lg p-4">
        <h4 className="font-semibold mb-2">About</h4>
        <Textarea
          {...register("bio")}
          onChange={(e) => handleFieldChange("bio", e.target.value)}
          placeholder="Tell us about yourself..."
          className="min-h-[100px]"
        />
      </div>

      {isMentor && (
        <>
          <div className="bg-muted rounded-lg p-4 space-y-4">
            <div>
              <h4 className="font-semibold mb-2">Skills</h4>
              <Input
                {...register("skills")}
                onChange={(e) => handleFieldChange("skills", e.target.value)}
                placeholder="Enter skills (comma-separated)"
              />
            </div>

            <div>
              <h4 className="font-semibold mb-2">Tools</h4>
              <Input
                {...register("tools_used")}
                onChange={(e) => handleFieldChange("tools_used", e.target.value)}
                placeholder="Enter tools (comma-separated)"
              />
            </div>
          </div>

          <div className="bg-muted rounded-lg p-4 space-y-4">
            <div>
              <h4 className="font-semibold mb-2">Keywords</h4>
              <Input
                {...register("keywords")}
                onChange={(e) => handleFieldChange("keywords", e.target.value)}
                placeholder="Enter keywords (comma-separated)"
              />
            </div>

            <div>
              <h4 className="font-semibold mb-2">Fields of Interest</h4>
              <Input
                {...register("fields_of_interest")}
                onChange={(e) => handleFieldChange("fields_of_interest", e.target.value)}
                placeholder="Enter fields of interest (comma-separated)"
              />
            </div>
          </div>

          <div className="bg-muted rounded-lg p-4 space-y-4">
            <h4 className="font-semibold mb-2">Links</h4>
            <div className="space-y-4">
              <Input
                {...register("linkedin_url")}
                onChange={(e) => handleFieldChange("linkedin_url", e.target.value)}
                placeholder="LinkedIn URL"
              />
              <Input
                {...register("github_url")}
                onChange={(e) => handleFieldChange("github_url", e.target.value)}
                placeholder="GitHub URL"
              />
              <Input
                {...register("website_url")}
                onChange={(e) => handleFieldChange("website_url", e.target.value)}
                placeholder="Website URL"
              />
            </div>
          </div>
        </>
      )}

      <div className="flex justify-end gap-4">
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