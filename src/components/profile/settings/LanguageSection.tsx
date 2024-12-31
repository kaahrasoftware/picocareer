import { useUserSettings } from "@/hooks/useUserSettings";
import { useAuthSession } from "@/hooks/useAuthSession";
import { useUserProfile } from "@/hooks/useUserProfile";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";

const languages = [
  { code: "en", name: "English" },
  { code: "es", name: "Spanish" },
  { code: "fr", name: "French" },
  { code: "de", name: "German" },
  { code: "zh", name: "Chinese" },
  { code: "ja", name: "Japanese" },
  { code: "ko", name: "Korean" },
  { code: "ar", name: "Arabic" },
  { code: "hi", name: "Hindi" },
  { code: "pt", name: "Portuguese" }
];

export function LanguageSection() {
  const { session } = useAuthSession();
  const { data: profile } = useUserProfile(session);
  const { getSetting, updateSetting } = useUserSettings(profile?.id);

  const currentLanguage = getSetting('language_preference') || 'en';

  const handleLanguageChange = (value: string) => {
    updateSetting.mutate({
      type: 'language_preference',
      value: value
    });
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium">Language</h3>
      <div className="space-y-2">
        <Label>Preferred Language</Label>
        <Select value={currentLanguage} onValueChange={handleLanguageChange}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Select language" />
          </SelectTrigger>
          <SelectContent>
            {languages.map((language) => (
              <SelectItem key={language.code} value={language.code}>
                {language.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <p className="text-sm text-muted-foreground">
          Choose your preferred language for the platform
        </p>
      </div>
    </div>
  );
}