
import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PersonalInfoSection } from "./form-sections/PersonalInfoSection";
import { BioSection } from "./form-sections/BioSection";
import { LocationSection } from "./form-sections/LocationSection";
import { EducationSection } from "./form-sections/EducationSection";
import { ProfessionalSection } from "./form-sections/ProfessionalSection";
import { SkillsSection } from "./form-sections/SkillsSection";
import { LinksSection } from "./form-sections/LinksSection";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAuthSession } from "@/hooks/useAuthSession";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Separator } from "@/components/ui/separator";
import { Profile } from "@/types/database/profile";

type Degree = "High School" | "No Degree" | "Associate" | "Bachelor" | "Master" | "PhD" | "MD";

interface FormData {
  first_name: string;
  last_name: string;
  bio: string;
  location: string;
  school_id: string;
  academic_major_id: string;
  position: string;
  company_id: string;
  years_of_experience: number;
  highest_degree: Degree;
  languages: string[];
  skills: string[];
  fields_of_interest: string[];
  X_url: string;
  linkedin_url: string;
  github_url: string;
  website_url: string;
}

interface ProfileEditFormProps {
  onClose: () => void;
}

export function ProfileEditForm({ onClose }: ProfileEditFormProps) {
  const { session } = useAuthSession();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { data: profile, isLoading } = useQuery({
    queryKey: ['profile', session?.user?.id],
    queryFn: async () => {
      if (!session?.user?.id) return null;
      
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', session.user.id)
        .single();
      
      if (error) throw error;
      return data as Profile;
    },
    enabled: !!session?.user?.id,
  });

  const form = useForm<FormData>({
    defaultValues: {
      first_name: "",
      last_name: "",
      bio: "",
      location: "",
      school_id: "",
      academic_major_id: "",
      position: "",
      company_id: "",
      years_of_experience: 0,
      highest_degree: "No Degree",
      languages: [],
      skills: [],
      fields_of_interest: [],
      X_url: "",
      linkedin_url: "",
      github_url: "",
      website_url: "",
    },
  });

  useEffect(() => {
    if (profile) {
      form.reset({
        first_name: profile.first_name || "",
        last_name: profile.last_name || "",
        bio: profile.bio || "",
        location: profile.location || "",
        school_id: profile.school_id || "",
        academic_major_id: profile.academic_major_id || "",
        position: profile.position || "",
        company_id: profile.company_id || "",
        years_of_experience: profile.years_of_experience || 0,
        highest_degree: (profile.highest_degree as Degree) || "No Degree",
        languages: profile.languages || [],
        skills: profile.skills || [],
        fields_of_interest: profile.fields_of_interest || [],
        X_url: profile.X_url || "",
        linkedin_url: profile.linkedin_url || "",
        github_url: profile.github_url || "",
        website_url: profile.website_url || "",
      });
    }
  }, [profile, form]);

  const onSubmit = async (data: FormData) => {
    if (!session?.user?.id) return;

    setIsSubmitting(true);
    try {
      const updateData = {
        ...data,
        highest_degree: data.highest_degree as "High School" | "No Degree" | "Associate" | "Bachelor" | "Master" | "PhD" | "MD",
      };

      const { error } = await supabase
        .from('profiles')
        .update(updateData)
        .eq('id', session.user.id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Profile updated successfully",
      });

      queryClient.invalidateQueries({ queryKey: ['profile'] });
      onClose();
    } catch (error) {
      console.error('Error updating profile:', error);
      toast({
        title: "Error",
        description: "Failed to update profile",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle>Edit Profile</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <PersonalInfoSection form={form} />
          <Separator />
          <BioSection form={form} />
          <Separator />
          <LocationSection form={form} />
          <Separator />
          <EducationSection 
            form={form} 
            currentDegree={form.watch("highest_degree") as Degree}
            onDegreeChange={(degree: Degree) => form.setValue("highest_degree", degree)}
          />
          <Separator />
          <ProfessionalSection form={form} />
          <Separator />
          <SkillsSection form={form} />
          <Separator />
          <LinksSection form={form} />
          
          <div className="flex justify-end gap-3 pt-6">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
