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
import { RefreshCw, Bug, Info, AlertTriangle, Clock } from "lucide-react";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { isTimezoneDST, getDSTTransitions, getTimezoneOffset } from "@/utils/timezoneUpdater";

interface TimezoneSectionProps {
  profileId?: string;
}

export function TimezoneSection({ profileId }: TimezoneSectionProps) {
  const { session } = useAuthSession();
  const { data: profile } = useUserProfile(session);
  const { getSetting } = useUserSettings(profileId || profile?.id);
  const { toast } = useToast();
  const currentTimezone = getSetting('timezone') || Intl.DateTimeFormat().resolvedOptions().timeZone;
  const [showDebug, setShowDebug] = useState(false);
  const [dstStatus, setDstStatus] = useState<{active: boolean, nextChange: string | null, offsetMinutes: number}>();

  const { updateTimezones, debugTimezone } = useTimezoneUpdate();
  const { updateTimezone } = useUpdateTimezone();
  const effectiveProfileId = profileId || profile?.id;
  const isCurrentUser = !profileId || profileId === profile?.id;
  const isAdmin = profile?.user_type === 'admin';

  useEffect(() => {
    if (currentTimezone) {
      checkDSTStatus(currentTimezone);
    }
  }, [currentTimezone]);

  const checkDSTStatus = async (timezone: string) => {
    try {
      const isDST = isTimezoneDST(timezone);
      const offsetMinutes = getTimezoneOffset(new Date(), timezone);
      const transitions = getDSTTransitions(timezone);
      
      let nextChangeDate = null;
      
      if (transitions.hasDST) {
        // Determine next transition date based on current DST status
        if (isDST && transitions.dstEnd) {
          nextChangeDate = transitions.dstEnd.toLocaleDateString();
        } else if (!isDST && transitions.dstStart) {
          nextChangeDate = transitions.dstStart.toLocaleDateString();
        }
      }
      
      setDstStatus({
        active: isDST,
        nextChange: nextChangeDate,
        offsetMinutes
      });
    } catch (error) {
      console.error('Error checking DST status:', error);
    }
  };

  const handleTimezoneChange = async (value: string) => {
    try {
      const success = await updateTimezone(effectiveProfileId as string, value);
      
      if (success) {
        // After setting timezone, check its DST status
        checkDSTStatus(value);
      }
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

  const handleForceUpdateTimezones = () => {
    if (confirm("This will update timezone offsets for all mentor availability slots, focusing on recurring slots first. Continue?")) {
      updateTimezones.mutate();
    }
  };

  const handleUpdateMySlots = async () => {
    if (!effectiveProfileId) {
      toast({
        title: "Error",
        description: "No profile ID available",
        variant: "destructive",
      });
      return;
    }
    
    toast({
      title: "Updating Slots",
      description: `Updating timezone information for ${isCurrentUser ? 'your' : 'mentor\'s'} availability slots...`,
    });
    
    try {
      // Get the current user's timezone
      const { data: userTimezone } = await supabase
        .from('user_settings')
        .select('setting_value')
        .eq('profile_id', effectiveProfileId)
        .eq('setting_type', 'timezone')
        .single();
      
      if (!userTimezone?.setting_value) {
        toast({
          title: "Error",
          description: `${isCurrentUser ? 'You' : 'Mentor'} must set ${isCurrentUser ? 'your' : 'their'} timezone first.`,
          variant: "destructive",
        });
        return;
      }
      
      // Calculate current offset
      const offsetMinutes = getTimezoneOffset(new Date(), userTimezone.setting_value);
      
      console.log('Updating slots with:', {
        timezone: userTimezone.setting_value,
        offsetMinutes,
        profileId: effectiveProfileId
      });
      
      // Update recurring slots first
      const { data: recurringSlots, error: recurringError } = await supabase
        .from('mentor_availability')
        .update({
          timezone_offset: offsetMinutes,
          reference_timezone: userTimezone.setting_value,
          dst_aware: true,
          last_dst_check: new Date().toISOString()
        })
        .eq('profile_id', effectiveProfileId)
        .eq('recurring', true)
        .select('id');
      
      if (recurringError) throw recurringError;
      
      // Then update non-recurring slots
      const { data: nonRecurringSlots, error: nonRecurringError } = await supabase
        .from('mentor_availability')
        .update({
          timezone_offset: offsetMinutes,
          reference_timezone: userTimezone.setting_value,
          dst_aware: true,
          last_dst_check: new Date().toISOString()
        })
        .eq('profile_id', effectiveProfileId)
        .eq('recurring', false)
        .select('id');
      
      if (nonRecurringError) throw nonRecurringError;
      
      const totalUpdated = (recurringSlots?.length || 0) + (nonRecurringSlots?.length || 0);
      
      toast({
        title: "Success",
        description: `Updated ${totalUpdated} availability slots with the current timezone information.`,
      });
      
      // Refresh DST status after update
      checkDSTStatus(userTimezone.setting_value);
    } catch (error) {
      console.error('Error updating personal slots:', error);
      toast({
        title: "Error",
        description: "Failed to update slots. Please try again.",
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
            <SelectValue placeholder="Select timezone" />
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
        <Clock className="h-4 w-4 mr-2"/>
        <AlertDescription>
          <div className="flex flex-col space-y-1">
            <div className="font-medium">
              Current time in {currentTimezone}:{' '}
              {new Date().toLocaleTimeString('en-US', { timeZone: currentTimezone })}
            </div>
            {dstStatus && (
              <div className="mt-1 text-sm flex flex-col gap-1">
                <span className={dstStatus.active ? "text-amber-500 flex items-center" : "text-green-500 flex items-center"}>
                  <Info className="h-3.5 w-3.5 mr-1" />
                  {dstStatus.active ? 
                    "Daylight Saving Time is currently active" : 
                    "Standard Time is currently active"}
                </span>
                {dstStatus.offsetMinutes && (
                  <span className="ml-1 text-muted-foreground">
                    Current UTC offset: {dstStatus.offsetMinutes} minutes
                  </span>
                )}
                {dstStatus.nextChange && (
                  <span className="ml-1 text-muted-foreground">
                    Next DST change: {dstStatus.nextChange}
                  </span>
                )}
              </div>
            )}
          </div>
        </AlertDescription>
      </Alert>

      {(isCurrentUser && profile?.user_type === 'mentor') || (!isCurrentUser && isAdmin) ? (
        <div className="mt-2">
          <Button
            onClick={handleUpdateMySlots}
            variant="outline"
            className="w-full"
          >
            <RefreshCw className="mr-2 h-4 w-4" />
            Update {isCurrentUser ? 'My' : 'Mentor\'s'} Availability Slots
          </Button>
          <p className="text-xs text-muted-foreground mt-1">
            This will update all {isCurrentUser ? 'your' : 'the mentor\'s'} availability slots with the current timezone information to handle DST changes.
          </p>
        </div>
      ) : null}

      {isAdmin && (
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
            This will update timezone offsets for all mentors to account for DST changes,
            focusing on recurring slots first.
          </p>
          
          <div className="mt-2 flex justify-between">
            <Button 
              onClick={() => setShowDebug(!showDebug)} 
              variant="ghost" 
              size="sm" 
              className="text-xs"
            >
              <Bug className="h-3 w-3 mr-1" />
              {showDebug ? 'Hide Debug' : 'Show Debug'}
            </Button>
            
            <Button
              onClick={handleForceUpdateTimezones}
              variant="ghost"
              size="sm"
              className="text-xs text-yellow-500 hover:text-yellow-600"
            >
              <AlertTriangle className="h-3 w-3 mr-1" />
              Force Update
            </Button>
          </div>
          
          {showDebug && (
            <div className="p-3 bg-muted/30 rounded-md border border-muted">
              <h4 className="text-sm font-medium mb-2">Timezone Debugging</h4>
              <div className="space-y-2">
                <p className="text-xs text-muted-foreground">
                  Timezone: {currentTimezone}<br />
                  Local offset: {-(new Date().getTimezoneOffset())} minutes<br />
                  Browser locale: {navigator.language || 'unknown'}<br />
                  DST active: {dstStatus?.active ? 'Yes' : 'No'}<br />
                  Calculated offset: {dstStatus?.offsetMinutes || 'Unknown'} minutes
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
                
                <div className="text-xs mt-2 p-2 bg-muted rounded border border-border">
                  <p className="font-medium">Expected timezone offsets:</p>
                  <ul className="list-disc pl-4 mt-1 space-y-1">
                    <li>America/New_York: -240 (EDT) or -300 (EST)</li>
                    <li>Europe/London: +60 (BST) or +0 (GMT)</li>
                    <li>America/Los_Angeles: -420 (PDT) or -480 (PST)</li>
                    <li>Asia/Tokyo: +540 (JST)</li>
                  </ul>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {profile?.user_type === 'mentor' && (
        <Alert className="mt-4">
          <AlertDescription className="text-sm text-muted-foreground">
            As a mentor, your timezone is important for scheduling sessions. Make sure it's correctly set to ensure accurate session times for your mentees.
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}
