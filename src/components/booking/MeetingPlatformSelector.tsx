import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { MeetingPlatform } from "@/types/calendar";

interface MeetingPlatformSelectorProps {
  value: MeetingPlatform;
  onValueChange: (value: MeetingPlatform) => void;
  onGoogleAuthErrorClear?: () => void;
}

export function MeetingPlatformSelector({ 
  value, 
  onValueChange,
  onGoogleAuthErrorClear 
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
          <SelectItem value="Google Meet">Google Meet</SelectItem>
          <SelectItem value="WhatsApp">WhatsApp</SelectItem>
          <SelectItem value="Telegram">Telegram</SelectItem>
          <SelectItem value="Phone Call">Phone Call</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}