import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { MentorEditForm } from "./mentor/MentorEditForm";
import { MentorDetails } from "./mentor/MentorDetails";
import type { Profile } from "@/types/database/profiles";
import type { Database } from "@/integrations/supabase/types";

type SessionType = Database["public"]["Enums"]["session_type"];

interface SessionTypeData {
  id: string;
  type: SessionType;
  duration: number;
  price: number;
  description: string | null;
}

interface SpecializationData {
  career: { title: string; id: string } | null;
  major: { title: string; id: string } | null;
  years_of_experience: number;
}

interface MentorTabProps {
  profile: Profile | null;
}

export function MentorTab({ profile }: MentorTabProps) {
  const [isEditing, setIsEditing] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: mentorData, isLoading } = useQuery({
    queryKey: ['mentor-details', profile?.id],
    queryFn: async () => {
      if (!profile?.id) return null;

      const [sessionTypesResponse, specializationsResponse] = await Promise.all([
        supabase
          .from('mentor_session_types')
          .select('*')
          .eq('profile_id', profile.id),
        supabase
          .from('mentor_specializations')
          .select(`
            *,
            career:careers(id, title),
            major:majors(id, title)
          `)
          .eq('profile_id', profile.id)
      ]);

      if (sessionTypesResponse.error) throw sessionTypesResponse.error;
      if (specializationsResponse.error) throw specializationsResponse.error;

      // Transform the data to match our expected types
      const formattedSpecializations: SpecializationData[] = specializationsResponse.data.map(spec => ({
        career: spec.career ? { id: spec.career.id, title: spec.career.title } : null,
        major: spec.major ? { id: spec.major.id, title: spec.major.title } : null,
        years_of_experience: spec.years_of_experience
      }));

      return {
        sessionTypes: sessionTypesResponse.data as SessionTypeData[],
        specializations: formattedSpecializations
      };
    },
    enabled: !!profile?.id
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-4">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!profile) return null;

  // Allow access for mentors, editors, and admins
  const canAccessMentorTab = ['mentor', 'editor', 'admin'].includes(profile.user_type || '');

  if (!canAccessMentorTab) {
    return (
      <div className="text-center p-8">
        <p className="text-muted-foreground">
          You need to be registered as a mentor, editor, or admin to access this section.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {isEditing ? (
        <MentorEditForm
          profile={profile}
          mentorData={mentorData}
          setIsEditing={setIsEditing}
        />
      ) : (
        <>
          <MentorDetails mentorData={mentorData} />
          <Button 
            onClick={() => setIsEditing(true)}
            className="w-full"
          >
            Edit Mentor Details
          </Button>
        </>
      )}
    </div>
  );
}