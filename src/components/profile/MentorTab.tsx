
import { supabase } from "@/integrations/supabase/client";
import { MentorshipStats } from "./mentor/MentorshipStats";
import { SessionTypeManager } from "./mentor/SessionTypeManager";
import { AvailabilityManager } from "./mentor/AvailabilityManager";
import { SessionSection } from "./settings/SessionSection";
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
  const { sessionTypes, refetchSessions, refetchSessionTypes } = useMentorStats(profileId);

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

        if (error) {
          console.error('Error checking timezone:', error);
          return;
        }

        // Show toast only if no timezone setting exists (count === 0)
        if (count === 0) {
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

  // Ensure sessionTypes have all required properties with defaults
  const enrichedSessionTypes = (sessionTypes || []).map(sessionType => {
    // Convert meeting_platform to the expected array format
    let meetingPlatforms: ("WhatsApp" | "Google Meet" | "Telegram" | "Phone Call")[] = ['Google Meet'];
    
    if (Array.isArray(sessionType.meeting_platform)) {
      meetingPlatforms = sessionType.meeting_platform.map(platform => {
        // Map platform values to expected string literals
        switch (platform) {
          case 'Zoom': return 'Google Meet'; // Map Zoom to Google Meet as fallback
          case 'Google Meet': return 'Google Meet';
          case 'Telegram': return 'Telegram';
          case 'WhatsApp': return 'WhatsApp';
          case 'Phone Call': return 'Phone Call';
          default: return 'Google Meet';
        }
      });
    }

    return {
      id: sessionType.id,
      profile_id: sessionType.profile_id,
      type: sessionType.type,
      custom_type_name: sessionType.custom_type_name || sessionType.type || 'Default Session',
      description: sessionType.description || '',
      duration: sessionType.duration || 60,
      phone_number: sessionType.phone_number || '',
      telegram_username: sessionType.telegram_username || '',
      meeting_platform: meetingPlatforms,
      token_cost: sessionType.token_cost || 0,
      price: sessionType.token_cost || 0, // Add price property mapped from token_cost
      created_at: sessionType.created_at,
      updated_at: sessionType.updated_at
    };
  });

  return (
    <Tabs defaultValue="stats" className="w-full">
      <TabsList>
        <TabsTrigger value="stats">Stats</TabsTrigger>
        <TabsTrigger value="session-types">Session Types</TabsTrigger>
        <TabsTrigger value="availability">Availability</TabsTrigger>
        <TabsTrigger value="settings">Settings</TabsTrigger>
      </TabsList>

      <TabsContent value="stats">
        <MentorshipStats profileId={profileId} />
      </TabsContent>

      <TabsContent value="session-types">
        <SessionTypeManager 
          profileId={profileId} 
          sessionTypes={enrichedSessionTypes}
          onUpdate={refetchSessionTypes}
        />
      </TabsContent>

      <TabsContent value="availability">
        <AvailabilityManager 
          profileId={profileId}
          onUpdate={refetchSessions}
        />
      </TabsContent>

      <TabsContent value="settings">
        <SessionSection profileId={profileId} />
      </TabsContent>
    </Tabs>
  );
}
