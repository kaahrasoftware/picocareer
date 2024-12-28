import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { useUserSettings } from "@/hooks/useUserSettings";
import { useAuthSession } from "@/hooks/useAuthSession";
import { useUserProfile } from "@/hooks/useUserProfile";

export function ThemeSection() {
  const { session } = useAuthSession();
  const { data: profile } = useUserProfile(session);
  const { getSetting, updateSetting } = useUserSettings(profile?.id);

  const darkMode = getSetting('theme') === 'dark';
  const compactMode = getSetting('compact_mode') === 'true';

  const handleThemeChange = (checked: boolean) => {
    updateSetting.mutate({
      type: 'theme',
      value: JSON.stringify({
        theme: checked ? 'dark' : 'light',
        compact_mode: compactMode
      })
    });
  };

  const handleCompactModeChange = (checked: boolean) => {
    const currentTheme = getSetting('theme') || 'light';
    updateSetting.mutate({
      type: 'theme',
      value: JSON.stringify({
        theme: currentTheme,
        compact_mode: checked
      })
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="space-y-0.5">
          <Label>Dark Mode</Label>
          <p className="text-sm text-muted-foreground">
            Toggle dark/light theme
          </p>
        </div>
        <Switch
          checked={darkMode}
          onCheckedChange={handleThemeChange}
        />
      </div>
      <div className="flex items-center justify-between">
        <div className="space-y-0.5">
          <Label>Compact Mode</Label>
          <p className="text-sm text-muted-foreground">
            Reduce spacing in the interface
          </p>
        </div>
        <Switch
          checked={compactMode}
          onCheckedChange={handleCompactModeChange}
        />
      </div>
    </div>
  );
}