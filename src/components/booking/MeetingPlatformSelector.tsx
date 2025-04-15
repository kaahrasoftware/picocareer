
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { MeetingPlatform } from "@/types/calendar";

interface MeetingPlatformSelectorProps {
  value: MeetingPlatform;
  onValueChange: (value: MeetingPlatform) => void;
  onGoogleAuthErrorClear?: () => void;
  availablePlatforms: MeetingPlatform[];
}

export function MeetingPlatformSelector({ 
  value, 
  onValueChange,
  onGoogleAuthErrorClear,
  availablePlatforms
}: MeetingPlatformSelectorProps) {
  if (availablePlatforms.length === 0) {
    return null;
  }

  return (
    <div className="space-y-2">
      <h4 className="font-semibold text-base">Meeting Platform</h4>
      <Select 
        value={value} 
        onValueChange={(value: MeetingPlatform) => {
          onValueChange(value);
          onGoogleAuthErrorClear?.();
        }}
      >
        <SelectTrigger className="w-full bg-white/5">
          <SelectValue placeholder="Select meeting platform" />
        </SelectTrigger>
        <SelectContent>
          {availablePlatforms.includes("Google Meet") && (
            <SelectItem value="Google Meet">Google Meet</SelectItem>
          )}
          {availablePlatforms.includes("WhatsApp") && (
            <SelectItem value="WhatsApp">WhatsApp</SelectItem>
          )}
          {availablePlatforms.includes("Telegram") && (
            <SelectItem value="Telegram">Telegram</SelectItem>
          )}
          {availablePlatforms.includes("Phone Call") && (
            <SelectItem value="Phone Call">Phone Call</SelectItem>
          )}
        </SelectContent>
      </Select>
    </div>
  );
}
