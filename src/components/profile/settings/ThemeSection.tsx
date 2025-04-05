
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { useUserSettings } from "@/hooks/useUserSettings";
import { useAuthSession } from "@/hooks/useAuthSession";
import { useUserProfile } from "@/hooks/useUserProfile";
import { useTheme } from "@/context/ThemeContext";
import { useEffect } from "react";

export function ThemeSection() {
  const { session } = useAuthSession();
  const { data: profile } = useUserProfile(session);
  const { getSetting, updateSetting } = useUserSettings(profile?.id);
  const { theme, setTheme } = useTheme();

  const darkMode = theme === 'dark';
  const compactMode = getSetting('compact_mode') === 'true';

  // When user settings load, sync with the theme context
  useEffect(() => {
    const userTheme = getSetting('theme');
    if (userTheme && (userTheme === 'dark' || userTheme === 'light')) {
      setTheme(userTheme);
    }
  }, [getSetting, setTheme]);

  const handleThemeChange = (checked: boolean) => {
    const newTheme = checked ? 'dark' : 'light';
    setTheme(newTheme);
    
    updateSetting.mutate({
      type: 'theme',
      value: JSON.stringify({
        theme: newTheme,
        compact_mode: compactMode
      })
    });
  };

  const handleCompactModeChange = (checked: boolean) => {
    updateSetting.mutate({
      type: 'theme',
      value: JSON.stringify({
        theme: darkMode ? 'dark' : 'light',
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
