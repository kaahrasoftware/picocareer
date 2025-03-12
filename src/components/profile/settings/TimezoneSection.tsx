
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useUserSettings } from "@/hooks/useUserSettings";
import { useAuthSession } from "@/hooks/useAuthSession";
import { useUserProfile } from "@/hooks/useUserProfile";
import { useToast } from "@/hooks/use-toast";
import { timeZones } from "./timezones";
import { Button } from "@/components/ui/button";
import { useTimezoneUpdate } from "@/hooks/useTimezoneUpdate";
import { RefreshCw, Bug } from "lucide-react";
import { useState } from "react";

export function TimezoneSection() {
  const { session } = useAuthSession();
  const { data: profile } = useUserProfile(session);
  const { getSetting, updateSetting } = useUserSettings(profile?.id);
  const { toast } = useToast();
  const currentTimezone = getSetting('timezone') || Intl.DateTimeFormat().resolvedOptions().timeZone;
  const [showDebug, setShowDebug] = useState(false);

  const { updateTimezones, debugTimezone } = useTimezoneUpdate();

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

  const handleDebugTimezone = () => {
    debugTimezone.mutate(currentTimezone);
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

      {profile?.user_type === 'admin' && (
        <div className="mt-4 space-y-4">
          <Button 
            onClick={() => updateTimezones.mutate()}
            disabled={updateTimezones.isPending}
            variant="outline"
            className="w-full"
          >
            <RefreshCw className={`mr-2 h-4 w-4 ${updateTimezones.isPending ? 'animate-spin' : ''}`} />
            {updateTimezones.isPending ? 'Updating Timezone Offsets...' : 'Update All Mentor Timezone Offsets'}
          </Button>
          <p className="text-xs text-muted-foreground mt-2">
            This will update timezone offsets for all mentors to account for DST changes.
          </p>
          
          <div className="mt-2">
            <Button 
              onClick={() => setShowDebug(!showDebug)} 
              variant="ghost" 
              size="sm" 
              className="text-xs"
            >
              <Bug className="h-3 w-3 mr-1" />
              {showDebug ? 'Hide Debug' : 'Show Debug'}
            </Button>
          </div>
          
          {showDebug && (
            <div className="p-3 bg-muted/30 rounded-md border border-muted">
              <h4 className="text-sm font-medium mb-2">Timezone Debugging</h4>
              <div className="space-y-2">
                <p className="text-xs text-muted-foreground">
                  Timezone: {currentTimezone}<br />
                  Local offset: {-(new Date().getTimezoneOffset())} minutes<br />
                  Browser locale: {navigator.language || 'unknown'}
                </p>
                <Button 
                  onClick={handleDebugTimezone}
                  disabled={debugTimezone.isPending}
                  variant="secondary"
                  size="sm"
                  className="w-full text-xs"
                >
                  Debug Current Timezone
                </Button>
              </div>
            </div>
          )}
        </div>
      )}

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
