import { useUserSettings } from "@/hooks/useUserSettings";
import { useState, useEffect } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
const languages = [{
  code: "en",
  name: "English"
}, {
  code: "es",
  name: "Spanish"
}, {
  code: "fr",
  name: "French"
}, {
  code: "de",
  name: "German"
}, {
  code: "zh",
  name: "Chinese"
}, {
  code: "ja",
  name: "Japanese"
}, {
  code: "ko",
  name: "Korean"
}, {
  code: "ar",
  name: "Arabic"
}, {
  code: "hi",
  name: "Hindi"
}, {
  code: "pt",
  name: "Portuguese"
}];
interface LanguageSectionProps {
  profileId: string;
}
export function LanguageSection({
  profileId
}: LanguageSectionProps) {
  const {
    getSetting,
    updateSetting
  } = useUserSettings(profileId);
  const [currentLanguage, setCurrentLanguage] = useState('en');
  useEffect(() => {
    const savedLanguage = getSetting('language_preference');
    if (savedLanguage) {
      setCurrentLanguage(savedLanguage);
    }
  }, [getSetting]);
  const handleLanguageChange = (value: string) => {
    updateSetting.mutate({
      type: 'language_preference',
      value: value
    });
    setCurrentLanguage(value);
  };
  return;
}