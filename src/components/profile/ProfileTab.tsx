import React from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Profile } from "@/types/database/profiles";

interface ProfileTabProps {
  profile: Profile & {
    company_name?: string | null;
    school_name?: string | null;
    academic_major?: string | null;
    career_title?: string | null;
    career?: {
      title?: string | null;
    } | null;
  };
}

export function ProfileTab({ profile }: ProfileTabProps) {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Profile Details</h2>
      <div className="bg-muted rounded-lg p-4">
        <h3 className="font-semibold">Personal Information</h3>
        <p>Name: {profile.full_name}</p>
        <p>Email: {profile.email}</p>
        <p>Location: {profile.location}</p>
      </div>
      <div className="bg-muted rounded-lg p-4">
        <h3 className="font-semibold">Education</h3>
        <p>School: {profile.school_name}</p>
        <p>Major: {profile.academic_major}</p>
        <p>Highest Degree: {profile.highest_degree}</p>
      </div>
      <div className="bg-muted rounded-lg p-4">
        <h3 className="font-semibold">Professional Information</h3>
        <p>Position: {profile.career_title}</p>
        <p>Company: {profile.company_name}</p>
        <p>Years of Experience: {profile.years_of_experience}</p>
      </div>
    </div>
  );
}
