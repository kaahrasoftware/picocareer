import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { useUserSettings } from "@/hooks/useUserSettings";
import { useState, useEffect } from "react";
interface ThemeSectionProps {
  profileId: string;
}
export function ThemeSection({
  profileId
}: ThemeSectionProps) {
  const {
    getSetting,
    updateSetting
  } = useUserSettings(profileId);
  const [darkMode, setDarkMode] = useState(false);
  const [compactMode, setCompactMode] = useState(false);
  useEffect(() => {
    try {
      const themeData = getSetting('theme');
      if (themeData) {
        const parsedTheme = JSON.parse(themeData);
        setDarkMode(parsedTheme.theme === 'dark');
        setCompactMode(parsedTheme.compact_mode || false);
      }
    } catch (error) {
      console.error("Error parsing theme data:", error);
    }
  }, [getSetting]);
  const handleThemeChange = (checked: boolean) => {
    const themeData = {
      theme: checked ? 'dark' : 'light',
      compact_mode: compactMode
    };
    updateSetting.mutate({
      type: 'theme',
      value: JSON.stringify(themeData)
    });
    setDarkMode(checked);
  };
  const handleCompactModeChange = (checked: boolean) => {
    const themeData = {
      theme: darkMode ? 'dark' : 'light',
      compact_mode: checked
    };
    updateSetting.mutate({
      type: 'theme',
      value: JSON.stringify(themeData)
    });
    setCompactMode(checked);
  };
  return <div className="space-y-4">
      <h3 className="text-lg font-medium">Theme Settings</h3>
      <div className="flex items-center justify-between">
        <div className="space-y-0.5">
          <Label htmlFor="dark-mode">Dark Mode</Label>
          <p className="text-sm text-muted-foreground">
            Toggle dark/light theme
          </p>
        </div>
        <Switch id="dark-mode" checked={darkMode} onCheckedChange={handleThemeChange} />
      </div>
      
    </div>;
}