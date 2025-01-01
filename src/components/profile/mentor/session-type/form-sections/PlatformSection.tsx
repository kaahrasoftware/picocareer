import { FormItem, FormLabel } from "@/components/ui/form";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import type { MeetingPlatform } from "@/types/calendar";

interface PlatformSectionProps {
  selectedPlatforms: MeetingPlatform[];
  onPlatformToggle: (platform: MeetingPlatform) => void;
}

export function PlatformSection({ selectedPlatforms, onPlatformToggle }: PlatformSectionProps) {
  return (
    <div className="space-y-2">
      <Label>Meeting Platforms</Label>
      <div className="grid grid-cols-2 gap-4">
        {["Google Meet", "Telegram", "WhatsApp", "Phone Call"].map((platform) => (
          <div key={platform} className="flex items-center space-x-2">
            <Checkbox
              id={platform}
              checked={selectedPlatforms.includes(platform as MeetingPlatform)}
              onCheckedChange={() => onPlatformToggle(platform as MeetingPlatform)}
            />
            <label
              htmlFor={platform}
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              {platform}
            </label>
          </div>
        ))}
      </div>
    </div>
  );
}