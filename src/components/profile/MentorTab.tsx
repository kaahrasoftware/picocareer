import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { MentorEditForm } from "./mentor/MentorEditForm";
import { MentorDetails } from "./mentor/MentorDetails";
import type { Profile } from "@/types/database/profiles";

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
            career:careers(title),
            major:majors(title)
          `)
          .eq('profile_id', profile.id)
      ]);

      if (sessionTypesResponse.error) throw sessionTypesResponse.error;
      if (specializationsResponse.error) throw specializationsResponse.error;

      return {
        sessionTypes: sessionTypesResponse.data,
        specializations: specializationsResponse.data
      };
    },
    enabled: !!profile?.id && profile.user_type === 'mentor'
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-4">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!profile) return null;

  if (profile.user_type !== 'mentor') {
    return (
      <div className="text-center p-8">
        <p className="text-muted-foreground">
          You need to be registered as a mentor to access this section.
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