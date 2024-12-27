import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

type MeetingPlatform = "google_meet" | "whatsapp" | "telegram";

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
          <SelectItem value="google_meet">Google Meet</SelectItem>
          <SelectItem value="whatsapp">WhatsApp</SelectItem>
          <SelectItem value="telegram">Telegram</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}