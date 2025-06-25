
import React from 'react';
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useUserSettings } from "@/hooks/useUserSettings";

interface DisplaySectionProps {
  profileId: string;
}

export function DisplaySection({ profileId }: DisplaySectionProps) {
  const { getSetting, updateSetting } = useUserSettings(profileId);

  const displaySettings = React.useMemo(() => {
    const settingsStr = getSetting('display_settings');
    if (settingsStr) {
      try {
        return JSON.parse(settingsStr);
      } catch (error) {
        console.error('Error parsing display settings:', error);
      }
    }
    return {
      compactMode: false,
      showAvatars: true,
      animationsEnabled: true,
    };
  }, [getSetting]);

  const handleToggle = (key: string, value: boolean) => {
    const newSettings = { ...displaySettings, [key]: value };
    updateSetting.mutate({
      type: 'display_settings',
      value: JSON.stringify(newSettings)
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-4">Display Settings</h3>
        <p className="text-sm text-muted-foreground mb-6">
          Customize how content is displayed in the application.
        </p>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Label htmlFor="compact-mode">Compact Mode</Label>
          <Switch
            id="compact-mode"
            checked={displaySettings.compactMode}
            onCheckedChange={(checked) => handleToggle('compactMode', checked)}
          />
        </div>

        <div className="flex items-center justify-between">
          <Label htmlFor="show-avatars">Show Avatars</Label>
          <Switch
            id="show-avatars"
            checked={displaySettings.showAvatars}
            onCheckedChange={(checked) => handleToggle('showAvatars', checked)}
          />
        </div>

        <div className="flex items-center justify-between">
          <Label htmlFor="animations-enabled">Enable Animations</Label>
          <Switch
            id="animations-enabled"
            checked={displaySettings.animationsEnabled}
            onCheckedChange={(checked) => handleToggle('animationsEnabled', checked)}
          />
        </div>
      </div>
    </div>
  );
}
