
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
  const { sessionTypes, isLoading, error } = useSessionTypeManager(profileId);

  console.log("MentorSettingsTab rendering for profile:", profile);
  console.log("Session types:", sessionTypes);
  console.log("Is loading:", isLoading);
  console.log("Error:", error);

  if (!profileId) {
    console.log("No profile ID available");
    return null;
  }

  if (profile.user_type !== 'mentor') {
    console.log("User is not a mentor:", profile.user_type);
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
    console.log("Refreshing mentor settings data for profile:", profileId);
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
              {error ? (
                <Alert variant="destructive">
                  <InfoIcon className="h-4 w-4 mr-2" />
                  <AlertDescription>
                    Error loading session types: {error.message}
                  </AlertDescription>
                </Alert>
              ) : (
                <SessionTypeManager 
                  profileId={profileId} 
                  sessionTypes={sessionTypes || []}
                  onUpdate={handleRefresh}
                />
              )}
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
