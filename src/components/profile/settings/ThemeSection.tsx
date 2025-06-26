
import React from 'react';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useUserSettings } from '@/hooks/useUserSettings';

interface ThemeSectionProps {
  profileId: string;
}

export function ThemeSection({ profileId }: ThemeSectionProps) {
  const { getSetting, updateSetting } = useUserSettings(profileId);
  const currentTheme = getSetting('theme') || 'system';

  const handleThemeChange = (value: string) => {
    updateSetting.mutate({
      type: 'theme',
      value: value
    });
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="theme-select">Theme</Label>
        <Select value={currentTheme} onValueChange={handleThemeChange}>
          <SelectTrigger id="theme-select">
            <SelectValue placeholder="Select theme" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="light">Light</SelectItem>
            <SelectItem value="dark">Dark</SelectItem>
            <SelectItem value="system">System</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
