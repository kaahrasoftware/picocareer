
import React from 'react';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useUserSettings } from '@/hooks/useUserSettings';

interface LanguageSectionProps {
  profileId: string;
}

export function LanguageSection({ profileId }: LanguageSectionProps) {
  const { getSetting, updateSetting } = useUserSettings(profileId);
  const currentLanguage = getSetting('language') || 'en';

  const handleLanguageChange = (value: string) => {
    updateSetting('language', value);
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="language-select">Language</Label>
        <Select value={currentLanguage} onValueChange={handleLanguageChange}>
          <SelectTrigger id="language-select">
            <SelectValue placeholder="Select language" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="en">English</SelectItem>
            <SelectItem value="es">Spanish</SelectItem>
            <SelectItem value="fr">French</SelectItem>
            <SelectItem value="de">German</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
