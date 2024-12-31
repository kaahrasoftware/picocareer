import { useUserSettings } from "@/hooks/useUserSettings";
import { useAuthSession } from "@/hooks/useAuthSession";
import { useUserProfile } from "@/hooks/useUserProfile";
import { useEffect } from "react";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

export function NotificationSection() {
  const { session } = useAuthSession();
  const { data: profile } = useUserProfile(session);
  const { getSetting, updateSetting } = useUserSettings(profile?.id);

  const notificationSettings = getSetting('notification_preferences');
  const parsedSettings = notificationSettings ? JSON.parse(notificationSettings) : null;
  const emailNotifications = parsedSettings?.email_notifications ?? true;
  const pushNotifications = parsedSettings?.push_notifications ?? true;

  // Set default notifications on first load if no settings exist
  useEffect(() => {
    if (profile?.id && !notificationSettings) {
      updateSetting.mutate({
        type: 'notification_preferences',
        value: JSON.stringify({
          email_notifications: true,
          push_notifications: true
        })
      });
    }
  }, [profile?.id, notificationSettings]);

  const handleNotificationChange = (type: 'email_notifications' | 'push_notifications', checked: boolean) => {
    const currentSettings = parsedSettings || {
      email_notifications: true,
      push_notifications: true
    };

    updateSetting.mutate({
      type: 'notification_preferences',
      value: JSON.stringify({
        ...currentSettings,
        [type]: checked
      })
    });
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium">Notifications</h3>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label>Email Notifications</Label>
            <p className="text-sm text-muted-foreground">
              Receive email notifications about your sessions and updates
            </p>
          </div>
          <Switch
            checked={emailNotifications}
            onCheckedChange={(checked) => handleNotificationChange('email_notifications', checked)}
          />
        </div>
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label>Push Notifications</Label>
            <p className="text-sm text-muted-foreground">
              Receive push notifications about your sessions and updates
            </p>
          </div>
          <Switch
            checked={pushNotifications}
            onCheckedChange={(checked) => handleNotificationChange('push_notifications', checked)}
          />
        </div>
      </div>
    </div>
  );
}