import React, { useState, useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { SessionTypeFormData } from "./session-type/types";
import { useAuthSession } from "@/hooks/useAuthSession";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select } from "@/components/ui/select";
import { Label } from "@/components/ui/label";

interface MentorFormData {
  bio: string;
  expertise_areas: string[];
  experience_level: string;
  languages: string[];
  hourly_rate: number;
  availability_hours: string;
  preferred_communication: string;
  linkedin_url: string;
  website_url: string;
  education_background: string;
  professional_background: string;
  certifications: string;
  achievements: string;
  interests: string;
  mentoring_approach: string;
  success_stories: string;
  preferred_mentee_level: string;
  session_types_offered: SessionTypeFormData[];
  availability_timezone: string;
  response_time: string;
  sessionTypes: SessionTypeFormData[];
}

interface MentorEditFormProps {
  profile: any;
  onSuccess?: () => void;
}

export function MentorEditForm({ profile, onSuccess }: MentorEditFormProps) {
  const { session } = useAuthSession();
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    control,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<MentorFormData>({
    defaultValues: {
      bio: profile?.bio || "",
      expertise_areas: profile?.expertise_areas || [],
      experience_level: profile?.experience_level || "",
      languages: profile?.languages || [],
      hourly_rate: profile?.hourly_rate || 0,
      availability_hours: profile?.availability_hours || "",
      preferred_communication: profile?.preferred_communication || "",
      linkedin_url: profile?.linkedin_url || "",
      website_url: profile?.website_url || "",
      education_background: profile?.education_background || "",
      professional_background: profile?.professional_background || "",
      certifications: profile?.certifications || "",
      achievements: profile?.achievements || "",
      interests: profile?.interests || "",
      mentoring_approach: profile?.mentoring_approach || "",
      success_stories: profile?.success_stories || "",
      preferred_mentee_level: profile?.preferred_mentee_level || "",
      session_types_offered: profile?.session_types_offered || [],
      availability_timezone: profile?.availability_timezone || "",
      response_time: profile?.response_time || "",
      sessionTypes: profile?.session_types_offered || [],
    },
  });

  const sessionTypes = watch("sessionTypes");

  useEffect(() => {
    if (profile?.session_types_offered) {
      setValue("sessionTypes", profile.session_types_offered);
    }
  }, [profile, setValue]);

  const handleSubmitForm = handleSubmit(async (data) => {
    await handleSubmitData(data);
  });

  const handleSubmitData = async (data: MentorFormData) => {
    if (!profile?.id) return;

    try {
      setIsLoading(true);

      // Update profile
      const { error: profileError } = await supabase
        .from("profiles")
        .update({
          bio: data.bio,
          expertise_areas: data.expertise_areas,
          experience_level: data.experience_level,
          languages: data.languages,
          hourly_rate: data.hourly_rate,
          availability_hours: data.availability_hours,
          preferred_communication: data.preferred_communication,
          linkedin_url: data.linkedin_url,
          website_url: data.website_url,
          education_background: data.education_background,
          professional_background: data.professional_background,
          certifications: data.certifications,
          achievements: data.achievements,
          interests: data.interests,
          mentoring_approach: data.mentoring_approach,
          success_stories: data.success_stories,
          preferred_mentee_level: data.preferred_mentee_level,
          session_types_offered: data.session_types_offered,
          availability_timezone: data.availability_timezone,
          response_time: data.response_time,
          updated_at: new Date().toISOString(),
        })
        .eq("id", profile.id);

      if (profileError) throw profileError;

      // Handle session types - delete existing and insert new ones
      if (data.sessionTypes && data.sessionTypes.length > 0) {
        // Delete existing session types
        const { error: deleteError } = await supabase
          .from("mentor_session_types")
          .delete()
          .eq("profile_id", profile.id);

        if (deleteError) throw deleteError;

        // Insert new session types one by one to avoid the array issue
        for (const sessionType of data.sessionTypes) {
          const { error: insertError } = await supabase
            .from("mentor_session_types")
            .insert({
              profile_id: profile.id,
              type: sessionType.type,
              duration: sessionType.duration,
              price: sessionType.price,
              description: sessionType.description,
              meeting_platform: sessionType.meeting_platform as any,
              telegram_username: sessionType.telegram_username,
              phone_number: sessionType.phone_number,
              custom_type_name: sessionType.custom_type_name,
            });

          if (insertError) throw insertError;
        }
      }

      toast({
        title: "Profile updated successfully",
        description: "Your mentor profile has been updated.",
      });

      onSuccess?.();
    } catch (error) {
      console.error("Error updating profile:", error);
      toast({
        title: "Error updating profile",
        description: "There was an error updating your profile. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmitForm} className="space-y-6">
      <div>
        <Label htmlFor="bio">Bio</Label>
        <Textarea id="bio" {...register("bio")} />
        {errors.bio && <p className="text-red-500">{errors.bio.message}</p>}
      </div>

      <div>
        <Label htmlFor="expertise_areas">Expertise Areas (comma separated)</Label>
        <Input
          id="expertise_areas"
          {...register("expertise_areas", {
            setValueAs: (v) => (typeof v === "string" ? v.split(",").map((s) => s.trim()) : v),
          })}
        />
        {errors.expertise_areas && <p className="text-red-500">{errors.expertise_areas.message}</p>}
      </div>

      <div>
        <Label htmlFor="experience_level">Experience Level</Label>
        <Input id="experience_level" {...register("experience_level")} />
        {errors.experience_level && <p className="text-red-500">{errors.experience_level.message}</p>}
      </div>

      <div>
        <Label htmlFor="languages">Languages (comma separated)</Label>
        <Input
          id="languages"
          {...register("languages", {
            setValueAs: (v) => (typeof v === "string" ? v.split(",").map((s) => s.trim()) : v),
          })}
        />
        {errors.languages && <p className="text-red-500">{errors.languages.message}</p>}
      </div>

      <div>
        <Label htmlFor="hourly_rate">Hourly Rate</Label>
        <Input type="number" id="hourly_rate" {...register("hourly_rate", { valueAsNumber: true })} />
        {errors.hourly_rate && <p className="text-red-500">{errors.hourly_rate.message}</p>}
      </div>

      <div>
        <Label htmlFor="availability_hours">Availability Hours</Label>
        <Input id="availability_hours" {...register("availability_hours")} />
        {errors.availability_hours && <p className="text-red-500">{errors.availability_hours.message}</p>}
      </div>

      <div>
        <Label htmlFor="preferred_communication">Preferred Communication</Label>
        <Input id="preferred_communication" {...register("preferred_communication")} />
        {errors.preferred_communication && <p className="text-red-500">{errors.preferred_communication.message}</p>}
      </div>

      <div>
        <Label htmlFor="linkedin_url">LinkedIn URL</Label>
        <Input id="linkedin_url" {...register("linkedin_url")} />
        {errors.linkedin_url && <p className="text-red-500">{errors.linkedin_url.message}</p>}
      </div>

      <div>
        <Label htmlFor="website_url">Website URL</Label>
        <Input id="website_url" {...register("website_url")} />
        {errors.website_url && <p className="text-red-500">{errors.website_url.message}</p>}
      </div>

      <div>
        <Label htmlFor="education_background">Education Background</Label>
        <Textarea id="education_background" {...register("education_background")} />
        {errors.education_background && <p className="text-red-500">{errors.education_background.message}</p>}
      </div>

      <div>
        <Label htmlFor="professional_background">Professional Background</Label>
        <Textarea id="professional_background" {...register("professional_background")} />
        {errors.professional_background && <p className="text-red-500">{errors.professional_background.message}</p>}
      </div>

      <div>
        <Label htmlFor="certifications">Certifications</Label>
        <Textarea id="certifications" {...register("certifications")} />
        {errors.certifications && <p className="text-red-500">{errors.certifications.message}</p>}
      </div>

      <div>
        <Label htmlFor="achievements">Achievements</Label>
        <Textarea id="achievements" {...register("achievements")} />
        {errors.achievements && <p className="text-red-500">{errors.achievements.message}</p>}
      </div>

      <div>
        <Label htmlFor="interests">Interests</Label>
        <Textarea id="interests" {...register("interests")} />
        {errors.interests && <p className="text-red-500">{errors.interests.message}</p>}
      </div>

      <div>
        <Label htmlFor="mentoring_approach">Mentoring Approach</Label>
        <Textarea id="mentoring_approach" {...register("mentoring_approach")} />
        {errors.mentoring_approach && <p className="text-red-500">{errors.mentoring_approach.message}</p>}
      </div>

      <div>
        <Label htmlFor="success_stories">Success Stories</Label>
        <Textarea id="success_stories" {...register("success_stories")} />
        {errors.success_stories && <p className="text-red-500">{errors.success_stories.message}</p>}
      </div>

      <div>
        <Label htmlFor="preferred_mentee_level">Preferred Mentee Level</Label>
        <Input id="preferred_mentee_level" {...register("preferred_mentee_level")} />
        {errors.preferred_mentee_level && <p className="text-red-500">{errors.preferred_mentee_level.message}</p>}
      </div>

      {/* Session Types Offered - This can be a complex UI, simplified here */}
      <div>
        <Label>Session Types Offered</Label>
        {/* For simplicity, just JSON stringify the sessionTypes */}
        <Textarea
          value={JSON.stringify(sessionTypes, null, 2)}
          readOnly
          rows={6}
          className="bg-gray-100"
        />
      </div>

      <div>
        <Label htmlFor="availability_timezone">Availability Timezone</Label>
        <Input id="availability_timezone" {...register("availability_timezone")} />
        {errors.availability_timezone && <p className="text-red-500">{errors.availability_timezone.message}</p>}
      </div>

      <div>
        <Label htmlFor="response_time">Response Time</Label>
        <Input id="response_time" {...register("response_time")} />
        {errors.response_time && <p className="text-red-500">{errors.response_time.message}</p>}
      </div>

      <Button type="submit" disabled={isLoading}>
        {isLoading ? "Saving..." : "Save Profile"}
      </Button>
    </form>
  );
}
