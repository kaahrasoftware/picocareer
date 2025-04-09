
import React, { useState, useEffect } from "react";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { useUserSettings } from "@/hooks/useUserSettings";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { InfoIcon, CheckIcon } from "lucide-react";
import { timezones } from "@/lib/timezones";

interface TimezoneSectionProps {
  profileId: string;
}

export function TimezoneSection({ profileId }: TimezoneSectionProps) {
  const { getSetting, updateSetting } = useUserSettings(profileId);
  const [timezone, setTimezone] = useState<string>(Intl.DateTimeFormat().resolvedOptions().timeZone);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saved' | 'saving'>('idle');
  const [browserTimezone] = useState<string>(Intl.DateTimeFormat().resolvedOptions().timeZone);

  useEffect(() => {
    const userTimezone = getSetting('timezone');
    if (userTimezone) {
      setTimezone(userTimezone);
    }
  }, [getSetting]);

  const handleTimezoneChange = (value: string) => {
    setTimezone(value);
  };

  const handleSaveTimezone = async () => {
    setSaveStatus('saving');
    try {
      await updateSetting.mutateAsync({
        type: 'timezone',
        value: timezone,
      });
      setSaveStatus('saved');
      setTimeout(() => setSaveStatus('idle'), 2000);
    } catch (error) {
      console.error('Error saving timezone:', error);
      setSaveStatus('idle');
    }
  };

  const handleUseBrowserTimezone = () => {
    setTimezone(browserTimezone);
  };

  const isUsingBrowserTimezone = timezone === browserTimezone;

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-semibold mb-2">Timezone</h3>
        <p className="text-sm text-muted-foreground mb-4">
          Set your timezone to ensure all schedules and meeting times are displayed correctly.
        </p>
      </div>

      {!isUsingBrowserTimezone && (
        <Alert variant="default" className="bg-muted">
          <InfoIcon className="h-4 w-4 mr-2" />
          <AlertDescription>
            Your selected timezone is different from your browser's detected timezone ({browserTimezone}).
            <Button variant="link" onClick={handleUseBrowserTimezone} className="p-0 h-auto ml-2">
              Use browser timezone
            </Button>
          </AlertDescription>
        </Alert>
      )}

      <div className="grid gap-3">
        <div className="space-y-2">
          <Label htmlFor="timezone">Your Timezone</Label>
          <Select value={timezone} onValueChange={handleTimezoneChange}>
            <SelectTrigger id="timezone" className="w-full">
              <SelectValue placeholder="Select timezone" />
            </SelectTrigger>
            <SelectContent>
              {timezones.map((tz) => (
                <SelectItem key={tz.value} value={tz.value}>
                  {tz.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <p className="text-xs text-muted-foreground">
            Current time in {timezone}: {new Date().toLocaleTimeString([], { timeZone: timezone })}
          </p>
        </div>

        <Button
          onClick={handleSaveTimezone}
          disabled={saveStatus === 'saving'}
          className="w-full sm:w-auto mt-4"
        >
          {saveStatus === 'saving' ? (
            <>Saving...</>
          ) : saveStatus === 'saved' ? (
            <>
              <CheckIcon className="h-4 w-4 mr-2" />
              Saved
            </>
          ) : (
            <>Save Timezone</>
          )}
        </Button>
      </div>
    </div>
  );
}
