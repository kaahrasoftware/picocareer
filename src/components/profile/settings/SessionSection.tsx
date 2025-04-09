
import React, { useState, useEffect } from "react";
import { useUserSettings } from "@/hooks/useUserSettings";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { CheckIcon, Info, Plus, Trash } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Badge } from "@/components/ui/badge";

interface SessionSectionProps {
  profileId: string;
}

interface SessionSettings {
  defaultSessionDuration: number;
  reminderTimes: Array<15 | 30 | 60 | 1440>;
  defaultMeetingPlatform: 'Google Meet' | 'Zoom' | 'Microsoft Teams' | 'Other';
  customMeetingPlatform: string;
  allowRescheduling: boolean;
  rescheduleTimeLimit: number;
  allowCancellation: boolean;
  cancellationTimeLimit: number;
}

const defaultSessionSettings: SessionSettings = {
  defaultSessionDuration: 30,
  reminderTimes: [30],
  defaultMeetingPlatform: 'Google Meet',
  customMeetingPlatform: '',
  allowRescheduling: true,
  rescheduleTimeLimit: 24,
  allowCancellation: true,
  cancellationTimeLimit: 24,
};

export function SessionSection({ profileId }: SessionSectionProps) {
  const { getSetting, updateSetting } = useUserSettings(profileId);
  const [settings, setSettings] = useState<SessionSettings>(defaultSessionSettings);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saved' | 'saving' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [newReminderTime, setNewReminderTime] = useState<15 | 30 | 60 | 1440>(30);

  useEffect(() => {
    const sessionSettings = getSetting('session_settings');
    if (sessionSettings) {
      try {
        const parsedSettings = JSON.parse(sessionSettings);
        setSettings(prevSettings => ({
          ...defaultSessionSettings,
          ...parsedSettings
        }));
      } catch (e) {
        console.error('Error parsing session settings:', e);
      }
    }
  }, [getSetting]);

  const handleToggle = (key: keyof SessionSettings, value: boolean) => {
    setSettings(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleInputChange = (key: keyof SessionSettings, value: string | number) => {
    setSettings(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const addReminderTime = () => {
    if (settings.reminderTimes.length >= 5) {
      setErrorMessage("Maximum of 5 reminder times allowed");
      return;
    }
    
    // Don't add duplicate times
    if (!settings.reminderTimes.includes(newReminderTime)) {
      setSettings(prev => ({
        ...prev,
        reminderTimes: [...prev.reminderTimes, newReminderTime].sort((a, b) => a - b)
      }));
      setErrorMessage(null);
    } else {
      setErrorMessage("This reminder time is already added");
    }
  };

  const removeReminderTime = (time: number) => {
    if (settings.reminderTimes.length <= 1) {
      setErrorMessage("At least one reminder time is required");
      return;
    }
    
    setSettings(prev => ({
      ...prev,
      reminderTimes: prev.reminderTimes.filter(t => t !== time)
    }));
    setErrorMessage(null);
  };

  const saveSettings = async () => {
    setSaveStatus('saving');
    setErrorMessage(null);
    try {
      await updateSetting.mutateAsync({
        type: 'session_settings',
        value: JSON.stringify(settings),
      });
      setSaveStatus('saved');
      setTimeout(() => setSaveStatus('idle'), 2000);
    } catch (error) {
      console.error('Error saving session settings:', error);
      setSaveStatus('error');
      setErrorMessage("There was a problem saving your settings. Please try again.");
      setTimeout(() => setSaveStatus('idle'), 5000);
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-semibold mb-2">Session Settings</h3>
        <p className="text-sm text-muted-foreground mb-4">
          Configure how your mentoring sessions are scheduled and managed.
        </p>
      </div>

      <Card>
        <CardContent className="pt-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Label htmlFor="defaultSessionDuration">Default Session Duration (minutes)</Label>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Info className="h-4 w-4 text-muted-foreground" />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p className="w-80">This will be the default duration for new session types you create.</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
              <Input
                id="defaultSessionDuration"
                type="number"
                min={15}
                max={120}
                step={15}
                value={settings.defaultSessionDuration}
                onChange={(e) => handleInputChange('defaultSessionDuration', parseInt(e.target.value) || 30)}
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Label>Session Reminder Times</Label>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Info className="h-4 w-4 text-muted-foreground" />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p className="w-80">You and your mentees will receive notifications at these times before sessions. You can add up to 5 reminder times.</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
                <Badge variant="outline" className="text-xs">
                  {settings.reminderTimes.length}/5
                </Badge>
              </div>
              
              <div className="flex flex-wrap gap-2 mb-2">
                {settings.reminderTimes.map(time => (
                  <Badge 
                    key={time} 
                    variant="secondary"
                    className="flex items-center gap-1 px-2 py-1"
                  >
                    {time === 1440 ? "1 day" : `${time} minutes`}
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-4 w-4 p-0 ml-1"
                      onClick={() => removeReminderTime(time)}
                    >
                      <Trash className="h-3 w-3" />
                      <span className="sr-only">Remove reminder</span>
                    </Button>
                  </Badge>
                ))}
              </div>
              
              <div className="flex items-center gap-2">
                <Select 
                  value={newReminderTime.toString()}
                  onValueChange={(value) => setNewReminderTime(parseInt(value) as 15 | 30 | 60 | 1440)}
                >
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Select time" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="15">15 minutes before</SelectItem>
                    <SelectItem value="30">30 minutes before</SelectItem>
                    <SelectItem value="60">1 hour before</SelectItem>
                    <SelectItem value="1440">1 day before</SelectItem>
                  </SelectContent>
                </Select>
                
                <Button 
                  type="button" 
                  variant="outline" 
                  size="sm"
                  onClick={addReminderTime}
                  disabled={settings.reminderTimes.length >= 5}
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Add
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Label htmlFor="defaultMeetingPlatform">Default Meeting Platform</Label>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Info className="h-4 w-4 text-muted-foreground" />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p className="w-80">This platform will be used for your meetings unless specified otherwise.</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
              <Select 
                value={settings.defaultMeetingPlatform}
                onValueChange={(value) => handleInputChange('defaultMeetingPlatform', value as any)}
              >
                <SelectTrigger id="defaultMeetingPlatform">
                  <SelectValue placeholder="Select platform" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Google Meet">Google Meet</SelectItem>
                  <SelectItem value="Zoom">Zoom</SelectItem>
                  <SelectItem value="Microsoft Teams">Microsoft Teams</SelectItem>
                  <SelectItem value="Other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {settings.defaultMeetingPlatform === 'Other' && (
              <div className="space-y-2">
                <Label htmlFor="customMeetingPlatform">Custom Meeting Platform</Label>
                <Input
                  id="customMeetingPlatform"
                  type="text"
                  value={settings.customMeetingPlatform}
                  onChange={(e) => handleInputChange('customMeetingPlatform', e.target.value)}
                  placeholder="Enter platform name"
                />
              </div>
            )}
          </div>

          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2">
                <Label htmlFor="allowRescheduling" className="font-medium">Allow Rescheduling</Label>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Info className="h-4 w-4 text-muted-foreground" />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p className="w-80">When enabled, mentees can reschedule sessions up until the time limit.</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
              <p className="text-sm text-muted-foreground">
                Allow mentees to reschedule sessions
              </p>
            </div>
            <Switch
              id="allowRescheduling"
              checked={settings.allowRescheduling}
              onCheckedChange={(value) => handleToggle('allowRescheduling', value)}
            />
          </div>

          {settings.allowRescheduling && (
            <div className="space-y-2 ml-6">
              <div className="flex items-center gap-2">
                <Label htmlFor="rescheduleTimeLimit">Reschedule Time Limit (hours before session)</Label>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Info className="h-4 w-4 text-muted-foreground" />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p className="w-80">Mentees can't reschedule a session if it's less than this many hours away.</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
              <Input
                id="rescheduleTimeLimit"
                type="number"
                min={1}
                max={72}
                value={settings.rescheduleTimeLimit}
                onChange={(e) => handleInputChange('rescheduleTimeLimit', parseInt(e.target.value) || 24)}
              />
            </div>
          )}

          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2">
                <Label htmlFor="allowCancellation" className="font-medium">Allow Cancellation</Label>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Info className="h-4 w-4 text-muted-foreground" />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p className="w-80">When enabled, mentees can cancel sessions up until the time limit.</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
              <p className="text-sm text-muted-foreground">
                Allow mentees to cancel sessions
              </p>
            </div>
            <Switch
              id="allowCancellation"
              checked={settings.allowCancellation}
              onCheckedChange={(value) => handleToggle('allowCancellation', value)}
            />
          </div>

          {settings.allowCancellation && (
            <div className="space-y-2 ml-6">
              <div className="flex items-center gap-2">
                <Label htmlFor="cancellationTimeLimit">Cancellation Time Limit (hours before session)</Label>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Info className="h-4 w-4 text-muted-foreground" />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p className="w-80">Mentees can't cancel a session if it's less than this many hours away.</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
              <Input
                id="cancellationTimeLimit"
                type="number"
                min={1}
                max={72}
                value={settings.cancellationTimeLimit}
                onChange={(e) => handleInputChange('cancellationTimeLimit', parseInt(e.target.value) || 24)}
              />
            </div>
          )}
        </CardContent>
      </Card>

      {errorMessage && (
        <div className="bg-destructive/10 text-destructive p-3 rounded-md text-sm">
          {errorMessage}
        </div>
      )}

      <Button
        onClick={saveSettings}
        disabled={saveStatus === 'saving'}
        className="mt-4"
      >
        {saveStatus === 'saving' ? (
          'Saving...'
        ) : saveStatus === 'saved' ? (
          <>
            <CheckIcon className="h-4 w-4 mr-2" />
            Saved
          </>
        ) : saveStatus === 'error' ? (
          'Try Again'
        ) : (
          'Save Session Settings'
        )}
      </Button>
    </div>
  );
}
