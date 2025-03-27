
import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SessionTypeManager } from "@/components/profile/mentor/SessionTypeManager";
import { AvailabilityManager } from "@/components/profile/mentor/AvailabilityManager";
import { TimezoneSection } from "@/components/profile/settings/TimezoneSection";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useSessionTypeManager } from "@/components/profile/mentor/hooks/useSessionTypeManager";
import { InfoIcon } from "lucide-react";
import type { Profile } from "@/types/database/profiles";

interface MentorSettingsTabProps {
  profile: Profile;
}

export function MentorSettingsTab({ profile }: MentorSettingsTabProps) {
  const profileId = profile?.id;
  const [activeTab, setActiveTab] = useState("session-types");
  const { sessionTypes } = useSessionTypeManager(profileId);

  if (!profileId) {
    return null;
  }

  if (profile.user_type !== 'mentor') {
    return (
      <Alert className="mt-4">
        <InfoIcon className="h-4 w-4 mr-2" />
        <AlertDescription>
          Mentor settings are only available for users with the mentor role.
        </AlertDescription>
      </Alert>
    );
  }

  const handleRefresh = () => {
    // This will be triggered when changes are made
    console.log("Refreshing mentor settings data");
  };

  return (
    <div className="space-y-4">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList>
          <TabsTrigger value="session-types">Session Types</TabsTrigger>
          <TabsTrigger value="availability">Availability</TabsTrigger>
          <TabsTrigger value="timezone">Timezone</TabsTrigger>
        </TabsList>

        <TabsContent value="session-types" className="pt-4">
          <Card>
            <CardHeader>
              <CardTitle>Session Types</CardTitle>
            </CardHeader>
            <CardContent>
              <SessionTypeManager 
                profileId={profileId} 
                sessionTypes={sessionTypes || []}
                onUpdate={handleRefresh}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="availability" className="pt-4">
          <AvailabilityManager 
            profileId={profileId}
            onUpdate={handleRefresh}
          />
        </TabsContent>

        <TabsContent value="timezone" className="pt-4">
          <Card>
            <CardHeader>
              <CardTitle>Timezone Settings</CardTitle>
            </CardHeader>
            <CardContent>
              <TimezoneSection />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
