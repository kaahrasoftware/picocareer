
import { useState, useEffect } from "react";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { useUserSettings } from "@/hooks/useUserSettings";
import { Badge } from "@/components/ui/badge";
import { Bell, BellOff, Mail, MessageSquare } from "lucide-react";

interface NotificationSectionProps {
  profileId: string;
}

export function NotificationSection({ profileId }: NotificationSectionProps) {
  const { getSetting, updateSetting } = useUserSettings(profileId);
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [appNotifications, setAppNotifications] = useState(true);
  const [mentorshipNotifications, setMentorshipNotifications] = useState(true);
  const [sessionReminders, setSessionReminders] = useState(true);

  useEffect(() => {
    try {
      // Get notification settings from user_settings
      const notificationSettings = getSetting('notification_settings');
      if (notificationSettings) {
        const settings = JSON.parse(notificationSettings);
        setEmailNotifications(settings.email_notifications ?? true);
        setAppNotifications(settings.app_notifications ?? true);
        setMentorshipNotifications(settings.mentorship_notifications ?? true);
        setSessionReminders(settings.session_reminders ?? true);
      }
    } catch (error) {
      console.error('Error parsing notification settings:', error);
    }
  }, [getSetting]);

  const handleNotificationChange = (type: string, value: boolean) => {
    // Update state based on notification type
    switch (type) {
      case 'email_notifications':
        setEmailNotifications(value);
        break;
      case 'app_notifications':
        setAppNotifications(value);
        break;
      case 'mentorship_notifications':
        setMentorshipNotifications(value);
        break;
      case 'session_reminders':
        setSessionReminders(value);
        break;
    }

    // Save all notification settings together
    const settings = {
      email_notifications: type === 'email_notifications' ? value : emailNotifications,
      app_notifications: type === 'app_notifications' ? value : appNotifications,
      mentorship_notifications: type === 'mentorship_notifications' ? value : mentorshipNotifications,
      session_reminders: type === 'session_reminders' ? value : sessionReminders,
    };

    // Update the settings in the database
    updateSetting.mutate({
      type: 'notification_settings',
      value: JSON.stringify(settings)
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-2">Notification Preferences</h3>
        <p className="text-sm text-muted-foreground mb-4">
          Configure how and when you receive notifications about activity on your account.
        </p>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <div className="flex items-center gap-2">
              <Mail className="h-4 w-4" />
              <Label htmlFor="email-notifications">Email Notifications</Label>
            </div>
            <p className="text-sm text-muted-foreground">
              Receive notifications via email
            </p>
          </div>
          <Switch
            id="email-notifications"
            checked={emailNotifications}
            onCheckedChange={(checked) => handleNotificationChange('email_notifications', checked)}
          />
        </div>

        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <div className="flex items-center gap-2">
              <Bell className="h-4 w-4" />
              <Label htmlFor="app-notifications">In-App Notifications</Label>
            </div>
            <p className="text-sm text-muted-foreground">
              Receive notifications in the app
            </p>
          </div>
          <Switch
            id="app-notifications"
            checked={appNotifications}
            onCheckedChange={(checked) => handleNotificationChange('app_notifications', checked)}
          />
        </div>

        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <div className="flex items-center gap-2">
              <MessageSquare className="h-4 w-4" />
              <Label htmlFor="mentorship-notifications">Mentorship Updates</Label>
              <Badge variant="outline" className="text-xs">Mentor</Badge>
            </div>
            <p className="text-sm text-muted-foreground">
              Notifications about new mentorship requests and messages
            </p>
          </div>
          <Switch
            id="mentorship-notifications"
            checked={mentorshipNotifications}
            onCheckedChange={(checked) => handleNotificationChange('mentorship_notifications', checked)}
          />
        </div>

        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <div className="flex items-center gap-2">
              <BellOff className="h-4 w-4" />
              <Label htmlFor="session-reminders">Session Reminders</Label>
            </div>
            <p className="text-sm text-muted-foreground">
              Receive reminders about upcoming sessions
            </p>
          </div>
          <Switch
            id="session-reminders"
            checked={sessionReminders}
            onCheckedChange={(checked) => handleNotificationChange('session_reminders', checked)}
          />
        </div>
      </div>
    </div>
  );
}
