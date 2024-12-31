import { useAuthSession } from "@/hooks/useAuthSession";
import { useUserProfile } from "@/hooks/useUserProfile";
import { Separator } from "@/components/ui/separator";
import { EmailSection } from "./settings/EmailSection";
import { TimezoneSection } from "./settings/TimezoneSection";
import { NotificationSection } from "./settings/NotificationSection";
import { Mail, Globe, Bell } from "lucide-react";

export function SettingsTab() {
  const { session } = useAuthSession();
  const { data: profile } = useUserProfile(session);

  if (!profile) return null;

  return (
    <div className="space-y-6 p-4">
      {/* Email Settings */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Mail className="h-5 w-5 text-primary" />
          <h3 className="text-lg font-semibold">Email Settings</h3>
        </div>
        <EmailSection currentEmail={profile.email} />
      </div>

      <Separator />

      {/* Timezone Settings */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Globe className="h-5 w-5 text-primary" />
          <h3 className="text-lg font-semibold">Timezone Settings</h3>
        </div>
        <TimezoneSection />
      </div>

      <Separator />

      {/* Notifications */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Bell className="h-5 w-5 text-primary" />
          <h3 className="text-lg font-semibold">Notifications</h3>
        </div>
        <NotificationSection />
      </div>
    </div>
  );
}