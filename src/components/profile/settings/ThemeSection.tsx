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
  return;
}