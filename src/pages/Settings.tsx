import { useEffect } from "react";
import { Card } from "@/components/ui/card";
import { EmailSection } from "@/components/profile/settings/EmailSection";
import { NotificationSection } from "@/components/profile/settings/NotificationSection";
import { ThemeSection } from "@/components/profile/settings/ThemeSection";
import { TimezoneSection } from "@/components/profile/settings/TimezoneSection";
import { LanguageSection } from "@/components/profile/settings/LanguageSection";

export function Settings() {
  useEffect(() => {
    document.title = "Settings | PicoCareer";
  }, []);

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-2xl font-bold mb-6">Settings</h1>
      <div className="space-y-6">
        <Card className="p-6">
          <EmailSection />
        </Card>
        <Card className="p-6">
          <NotificationSection />
        </Card>
        <Card className="p-6">
          <ThemeSection />
        </Card>
        <Card className="p-6">
          <TimezoneSection />
        </Card>
        <Card className="p-6">
          <LanguageSection />
        </Card>
      </div>
    </div>
  );
}