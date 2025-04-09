
import React, { useState, useEffect } from "react";
import { useUserSettings } from "@/hooks/useUserSettings";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CheckIcon } from "lucide-react";

interface NotificationSectionProps {
  profileId: string;
}

interface NotificationPreferences {
  email: {
    sessions: boolean;
    mentorship: boolean;
    system: boolean;
    marketing: boolean;
  };
  push: {
    sessions: boolean;
    mentorship: boolean;
    system: boolean;
    marketing: boolean;
  };
}

const defaultPreferences: NotificationPreferences = {
  email: {
    sessions: true,
    mentorship: true,
    system: true,
    marketing: false,
  },
  push: {
    sessions: true,
    mentorship: true,
    system: true,
    marketing: false,
  },
};

export function NotificationSection({ profileId }: NotificationSectionProps) {
  const { getSetting, updateSetting } = useUserSettings(profileId);
  const [preferences, setPreferences] = useState<NotificationPreferences>(defaultPreferences);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saved' | 'saving'>('idle');

  useEffect(() => {
    const notificationPreferences = getSetting('notification_preferences');
    if (notificationPreferences) {
      try {
        setPreferences(JSON.parse(notificationPreferences));
      } catch (e) {
        console.error('Error parsing notification preferences:', e);
      }
    }
  }, [getSetting]);

  const handleToggle = (
    channel: 'email' | 'push',
    type: 'sessions' | 'mentorship' | 'system' | 'marketing',
    value: boolean
  ) => {
    setPreferences((prev) => ({
      ...prev,
      [channel]: {
        ...prev[channel],
        [type]: value,
      },
    }));
  };

  const savePreferences = async () => {
    setSaveStatus('saving');
    try {
      await updateSetting.mutateAsync({
        type: 'notification_preferences',
        value: JSON.stringify(preferences),
      });
      setSaveStatus('saved');
      setTimeout(() => setSaveStatus('idle'), 2000);
    } catch (error) {
      console.error('Error saving notification preferences:', error);
      setSaveStatus('idle');
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-semibold mb-2">Notification Preferences</h3>
        <p className="text-sm text-muted-foreground mb-4">
          Control how and when you receive notifications.
        </p>
      </div>

      <Tabs defaultValue="email" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="email">Email Notifications</TabsTrigger>
          <TabsTrigger value="push">Push Notifications</TabsTrigger>
        </TabsList>

        <TabsContent value="email" className="space-y-4 mt-4">
          <Card>
            <CardContent className="pt-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="email-sessions" className="font-medium">Session Updates</Label>
                    <p className="text-sm text-muted-foreground">
                      Notifications about upcoming sessions, cancellations, and rescheduling
                    </p>
                  </div>
                  <Switch
                    id="email-sessions"
                    checked={preferences.email.sessions}
                    onCheckedChange={(value) => handleToggle('email', 'sessions', value)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="email-mentorship" className="font-medium">Mentorship Activity</Label>
                    <p className="text-sm text-muted-foreground">
                      Updates related to your mentorship activities and connections
                    </p>
                  </div>
                  <Switch
                    id="email-mentorship"
                    checked={preferences.email.mentorship}
                    onCheckedChange={(value) => handleToggle('email', 'mentorship', value)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="email-system" className="font-medium">System Notifications</Label>
                    <p className="text-sm text-muted-foreground">
                      Important updates about your account, security alerts, and platform changes
                    </p>
                  </div>
                  <Switch
                    id="email-system"
                    checked={preferences.email.system}
                    onCheckedChange={(value) => handleToggle('email', 'system', value)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="email-marketing" className="font-medium">Marketing & Promotional</Label>
                    <p className="text-sm text-muted-foreground">
                      News, feature updates, and promotional content
                    </p>
                  </div>
                  <Switch
                    id="email-marketing"
                    checked={preferences.email.marketing}
                    onCheckedChange={(value) => handleToggle('email', 'marketing', value)}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="push" className="space-y-4 mt-4">
          <Card>
            <CardContent className="pt-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="push-sessions" className="font-medium">Session Updates</Label>
                    <p className="text-sm text-muted-foreground">
                      Notifications about upcoming sessions, cancellations, and rescheduling
                    </p>
                  </div>
                  <Switch
                    id="push-sessions"
                    checked={preferences.push.sessions}
                    onCheckedChange={(value) => handleToggle('push', 'sessions', value)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="push-mentorship" className="font-medium">Mentorship Activity</Label>
                    <p className="text-sm text-muted-foreground">
                      Updates related to your mentorship activities and connections
                    </p>
                  </div>
                  <Switch
                    id="push-mentorship"
                    checked={preferences.push.mentorship}
                    onCheckedChange={(value) => handleToggle('push', 'mentorship', value)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="push-system" className="font-medium">System Notifications</Label>
                    <p className="text-sm text-muted-foreground">
                      Important updates about your account, security alerts, and platform changes
                    </p>
                  </div>
                  <Switch
                    id="push-system"
                    checked={preferences.push.system}
                    onCheckedChange={(value) => handleToggle('push', 'system', value)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="push-marketing" className="font-medium">Marketing & Promotional</Label>
                    <p className="text-sm text-muted-foreground">
                      News, feature updates, and promotional content
                    </p>
                  </div>
                  <Switch
                    id="push-marketing"
                    checked={preferences.push.marketing}
                    onCheckedChange={(value) => handleToggle('push', 'marketing', value)}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Button
        onClick={savePreferences}
        disabled={saveStatus === 'saving'}
        className="mt-4"
      >
        {saveStatus === 'saving' ? (
          'Saving...'
        ) : saveStatus === 'saved' ? (
          <>
            <CheckIcon className="h-4 w-4 mr-2" />
            Saved
          </>
        ) : (
          'Save Preferences'
        )}
      </Button>
    </div>
  );
}
