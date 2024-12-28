import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { useUserSettings } from "@/hooks/useUserSettings";
import { useAuthSession } from "@/hooks/useAuthSession";
import { useUserProfile } from "@/hooks/useUserProfile";

export function NotificationSection() {
  const { session } = useAuthSession();
  const { data: profile } = useUserProfile(session);
  const { getSetting, updateSetting } = useUserSettings(profile?.id);

  const emailNotifications = getSetting('email_notifications') === 'true';
  const pushNotifications = getSetting('push_notifications') === 'true';

  const handleNotificationChange = (type: 'email_notifications' | 'push_notifications', checked: boolean) => {
    const currentSettings = {
      email_notifications: getSetting('email_notifications') === 'true',
      push_notifications: getSetting('push_notifications') === 'true'
    };

    updateSetting.mutate({
      type: 'notifications',
      value: JSON.stringify({
        ...currentSettings,
        [type]: checked
      })
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="space-y-0.5">
          <Label>Email Notifications</Label>
          <p className="text-sm text-muted-foreground">
            Receive updates about your account via email
          </p>
        </div>
        <Switch
          checked={emailNotifications}
          onCheckedChange={(checked) => {
            handleNotificationChange('email_notifications', checked);
          }}
        />
      </div>
      <div className="flex items-center justify-between">
        <div className="space-y-0.5">
          <Label>Push Notifications</Label>
          <p className="text-sm text-muted-foreground">
            Get notified about new messages and updates
          </p>
        </div>
        <Switch
          checked={pushNotifications}
          onCheckedChange={(checked) => {
            handleNotificationChange('push_notifications', checked);
          }}
        />
      </div>
    </div>
  );
}