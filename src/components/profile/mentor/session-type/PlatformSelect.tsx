
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Checkbox } from "@/components/ui/checkbox";
import { Control } from "react-hook-form";
import { SessionTypeFormData, MeetingPlatform } from "./types";

interface PlatformSelectProps {
  form: {
    control: Control<SessionTypeFormData>;
    setValue: (name: keyof SessionTypeFormData, value: any) => void;
    watch: (name: keyof SessionTypeFormData) => any;
  };
}

const PLATFORMS: { value: MeetingPlatform; label: string }[] = [
  { value: "Google Meet", label: "Google Meet" },
  { value: "WhatsApp", label: "WhatsApp" },
  { value: "Telegram", label: "Telegram" },
  { value: "Phone Call", label: "Phone Call" }
];

export function PlatformSelect({ form }: PlatformSelectProps) {
  const selectedPlatforms = form.watch("meeting_platform") || [];

  const handlePlatformChange = (platform: MeetingPlatform, checked: boolean) => {
    const currentPlatforms = Array.isArray(selectedPlatforms) ? selectedPlatforms : [];
    
    if (checked) {
      const newPlatforms = [...currentPlatforms, platform];
      form.setValue("meeting_platform", newPlatforms);
    } else {
      const newPlatforms = currentPlatforms.filter((p: MeetingPlatform) => p !== platform);
      form.setValue("meeting_platform", newPlatforms);
    }
  };

  return (
    <FormField
      control={form.control}
      name="meeting_platform"
      rules={{ required: "At least one meeting platform is required" }}
      render={() => (
        <FormItem>
          <FormLabel>Meeting Platform(s)</FormLabel>
          <FormControl>
            <div className="space-y-2">
              {PLATFORMS.map((platform) => (
                <div key={platform.value} className="flex items-center space-x-2">
                  <Checkbox
                    id={platform.value}
                    checked={Array.isArray(selectedPlatforms) && selectedPlatforms.includes(platform.value)}
                    onCheckedChange={(checked) => handlePlatformChange(platform.value, !!checked)}
                  />
                  <label htmlFor={platform.value} className="text-sm font-medium">
                    {platform.label}
                  </label>
                </div>
              ))}
            </div>
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}
