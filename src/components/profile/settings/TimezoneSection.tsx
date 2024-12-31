import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useUserSettings } from "@/hooks/useUserSettings";
import { useAuthSession } from "@/hooks/useAuthSession";
import { useUserProfile } from "@/hooks/useUserProfile";
import { useToast } from "@/hooks/use-toast";
import { timeZones } from "./timezones";

export function TimezoneSection() {
  const { session } = useAuthSession();
  const { data: profile } = useUserProfile(session);
  const { getSetting, updateSetting } = useUserSettings(profile?.id);
  const { toast } = useToast();
  const currentTimezone = getSetting('timezone') || Intl.DateTimeFormat().resolvedOptions().timeZone;

  const handleTimezoneChange = async (value: string) => {
    try {
      await updateSetting.mutate({ 
        type: 'timezone', 
        value 
      });
      
      toast({
        title: "Timezone updated",
        description: "Your timezone has been successfully updated. This will be used for all your mentoring sessions.",
      });
    } catch (error) {
      console.error('Error updating timezone:', error);
      toast({
        title: "Error",
        description: "Failed to update timezone. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-2">
        <Label htmlFor="timezone">Timezone</Label>
        <Select
          value={currentTimezone}
          onValueChange={handleTimezoneChange}
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Select your timezone" />
          </SelectTrigger>
          <SelectContent>
            {timeZones.map((tz) => (
              <SelectItem key={tz} value={tz}>
                {tz} ({new Date().toLocaleTimeString('en-US', { timeZone: tz })})
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <Alert>
        <AlertDescription>
          Current time in {currentTimezone}:{' '}
          {new Date().toLocaleTimeString('en-US', { timeZone: currentTimezone })}
        </AlertDescription>
      </Alert>

      {profile?.user_type === 'mentor' && (
        <Alert>
          <AlertDescription className="text-sm text-muted-foreground">
            As a mentor, your timezone is important for scheduling sessions. Make sure it's correctly set to ensure accurate session times for your mentees.
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}