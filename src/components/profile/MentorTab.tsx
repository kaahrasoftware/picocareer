import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MentorshipStats } from "./mentor/MentorshipStats";
import { SessionTypeManager } from "./mentor/SessionTypeManager";
import { AvailabilityManager } from "./mentor/AvailabilityManager";
import { useMentorStats } from "./mentor/hooks/useMentorStats";
import type { Profile } from "@/types/database/profiles";

interface MentorTabProps {
  profile: Profile;
}

export function MentorTab({ profile }: MentorTabProps) {
  const profileId = profile?.id;
  const { stats, refetchSessions, refetchSessionTypes, sessionTypes } = useMentorStats(profileId);

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