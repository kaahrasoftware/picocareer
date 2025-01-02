import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { MeetingPlatform } from "@/types/calendar";

interface MeetingPlatformSelectorProps {
  value: MeetingPlatform;
  onValueChange: (value: MeetingPlatform) => void;
  onGoogleAuthErrorClear?: () => void;
  availablePlatforms?: MeetingPlatform[];
}

export function MeetingPlatformSelector({ 
  value, 
  onValueChange,
  onGoogleAuthErrorClear,
  availablePlatforms = ["Google Meet"] // Default to Google Meet if no platforms provided
}: MeetingPlatformSelectorProps) {
  return (
    <div>
      <h4 className="font-semibold mb-2">Meeting Platform</h4>
      <Select 
        value={value} 
        onValueChange={(value: MeetingPlatform) => {
          onValueChange(value);
          onGoogleAuthErrorClear?.();
        }}
      >
        <SelectTrigger>
          <SelectValue placeholder="Select meeting platform" />
        </SelectTrigger>
        <SelectContent>
          {availablePlatforms.map((platform) => (
            <SelectItem key={platform} value={platform}>
              {platform}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}