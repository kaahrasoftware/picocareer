import { supabase } from "@/integrations/supabase/client";
import { MentorshipStats } from "./mentor/MentorshipStats";
import { SessionTypeManager } from "./mentor/SessionTypeManager";
import { AvailabilityManager } from "./mentor/AvailabilityManager";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { useEffect } from "react";
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
        console.log('Checking timezone for profile:', profileId);
        const { data, error } = await supabase
          .from('user_settings')
          .select('setting_value')
          .eq('profile_id', profileId)
          .eq('setting_type', 'timezone')
          .maybeSingle();

        if (error) {
          console.error('Error checking timezone:', error);
          return;
        }

        // Only show toast if there's no timezone set (data will be null)
        if (!data) {
          toast({
            title: "Timezone not set",
            description: "Please set your timezone in settings to ensure accurate scheduling.",
            variant: "destructive",
          });
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