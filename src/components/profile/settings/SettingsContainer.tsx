import React from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { TimezoneSection } from "./TimezoneSection";
import { NotificationSection } from "./NotificationSection";
import { DisplaySection } from "./DisplaySection";
import { PrivacySection } from "./PrivacySection";
import { AccessibilitySection } from "./AccessibilitySection";
import { ThemeSection } from "./ThemeSection";
import { LanguageSection } from "./LanguageSection";
import { useMobileMenu } from "@/context/MobileMenuContext";
interface SettingsContainerProps {
  profileId?: string;
}
export function SettingsContainer({
  profileId
}: SettingsContainerProps) {
  const {
    closeMobileMenu
  } = useMobileMenu();
  if (!profileId) {
    return <Card>
        <CardHeader>
          <CardTitle>Settings</CardTitle>
          <CardDescription>You need to be logged in to access settings.</CardDescription>
        </CardHeader>
      </Card>;
  }
  const handleTabChange = () => {
    closeMobileMenu();
  };
  return <Card className="w-full">
      <CardHeader>
        <CardTitle>Settings</CardTitle>
        <CardDescription>Manage your account preferences and settings</CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="interface" className="w-full" onValueChange={handleTabChange}>
          <TabsList className="grid grid-cols-3 sm:grid-cols-5 mb-4">
            <TabsTrigger value="interface">General</TabsTrigger>
            
            
            <TabsTrigger value="display">Display</TabsTrigger>
            <TabsTrigger value="accessibility">Accessibility</TabsTrigger>
          </TabsList>
          
          <TabsContent value="interface">
            <div className="space-y-8">
              <TimezoneSection profileId={profileId} />
              <ThemeSection profileId={profileId} />
              <LanguageSection profileId={profileId} />
            </div>
          </TabsContent>
          
          <TabsContent value="notifications">
            <NotificationSection profileId={profileId} />
          </TabsContent>
          
          <TabsContent value="privacy">
            <PrivacySection profileId={profileId} />
          </TabsContent>
          
          <TabsContent value="display">
            <DisplaySection profileId={profileId} />
          </TabsContent>
          
          <TabsContent value="accessibility">
            <AccessibilitySection profileId={profileId} />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>;
}