import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { PersonalSection } from "./sections/PersonalSection";
import { BioSection } from "./sections/BioSection";
import { FormFields, ProfileFormProps, Degree } from "./types/form-types";

export function ProfileEditForm({ profile, onCancel, onSuccess }: ProfileFormProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [localProfile, setLocalProfile] = useState(profile);
  const isMentee = profile.user_type === 'mentee';
  
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
      highest_degree: (profile.highest_degree as Degree) || "No Degree",
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
        first_name: data.first_name,
        last_name: data.last_name,
        bio: data.bio,
        location: data.location,
        ...(isMentee ? {} : {
          position: data.position,
          company_id: data.company_id,
          years_of_experience: data.years_of_experience,
          academic_major_id: data.academic_major_id,
          highest_degree: data.highest_degree,
          skills: data.skills ? data.skills.split(",").map(s => s.trim()) : [],
          tools_used: data.tools_used ? data.tools_used.split(",").map(t => t.trim()) : [],
          keywords: data.keywords ? data.keywords.split(",").map(k => k.trim()) : [],
          fields_of_interest: data.fields_of_interest ? data.fields_of_interest.split(",").map(f => f.trim()) : [],
          linkedin_url: data.linkedin_url,
          github_url: data.github_url,
          website_url: data.website_url,
        })
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
      
      <BioSection 
        register={register}
        handleFieldChange={handleFieldChange}
      />

      {/* Form Actions */}
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