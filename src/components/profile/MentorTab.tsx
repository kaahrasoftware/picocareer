import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { MentorshipStats } from "./mentor/MentorshipStats";
import { SessionTypeManager } from "./mentor/SessionTypeManager";
import { AvailabilityManager } from "./mentor/AvailabilityManager";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { useMentorStats } from "./mentor/hooks/useMentorStats";
import type { Profile } from "@/types/database/profiles";

interface MentorTabProps {
  profile: Profile;
}

export function MentorTab({ profile }: MentorTabProps) {
  const { toast } = useToast();
  const profileId = profile?.id;
  const { stats, refetchSessions, refetchSessionTypes, sessionTypes } = useMentorStats(profileId);

  useEffect(() => {
    if (!profileId) return;

    const checkTimezone = async () => {
      try {
        // Check if a timezone setting exists for this user
        const { count, error } = await supabase
          .from('user_settings')
          .select('*', { count: 'exact', head: true })
          .eq('profile_id', profileId)
          .eq('setting_type', 'timezone');

        // Log the query results
        console.log('Timezone check results:', {
          profileId,
          count,
          error
        });

        if (error) {
          console.error('Error checking timezone:', error);
          return;
        }

        // Show toast only if no timezone setting exists (count === 0)
        if (count === 0) {
          console.log('No timezone setting found, showing toast');
          toast({
            title: "Timezone not set",
            description: "Please set your timezone in settings to ensure accurate scheduling.",
            variant: "destructive",
          });
        } else {
          console.log('Timezone setting exists, count:', count);
        }
      } catch (error) {
        console.error('Error checking timezone:', error);
      }
    };

    checkTimezone();
  }, [profileId, toast]);

  if (!profileId) {
    return null;
  }

  return (
    <Tabs defaultValue="stats" className="w-full">
      <TabsList>
        <TabsTrigger value="stats">Stats</TabsTrigger>
        <TabsTrigger value="session-types">Session Types</TabsTrigger>
        <TabsTrigger value="availability">Availability</TabsTrigger>
      </TabsList>

      <TabsContent value="stats">
        {stats && <MentorshipStats stats={stats} />}
      </TabsContent>

      <TabsContent value="session-types">
        <SessionTypeManager 
          profileId={profileId} 
          sessionTypes={sessionTypes || []}
          onUpdate={refetchSessionTypes}
        />
      </TabsContent>

      <TabsContent value="availability">
        <AvailabilityManager 
          profileId={profileId}
          onUpdate={refetchSessions}
        />
      </TabsContent>
    </Tabs>
  );
}