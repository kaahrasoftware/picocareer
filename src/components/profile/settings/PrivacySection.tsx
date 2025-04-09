
import React, { useState, useEffect } from "react";
import { useUserSettings } from "@/hooks/useUserSettings";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CheckIcon } from "lucide-react";

interface PrivacySectionProps {
  profileId: string;
}

interface PrivacySettings {
  profileVisibility: 'public' | 'mentees' | 'private';
  shareAvailability: boolean;
  shareContactDetails: boolean;
  allowPublicBooking: boolean;
  allowMenteeReviews: boolean;
}

const defaultPrivacySettings: PrivacySettings = {
  profileVisibility: 'public',
  shareAvailability: true,
  shareContactDetails: false,
  allowPublicBooking: true,
  allowMenteeReviews: true,
};

export function PrivacySection({ profileId }: PrivacySectionProps) {
  const { getSetting, updateSetting } = useUserSettings(profileId);
  const [settings, setSettings] = useState<PrivacySettings>(defaultPrivacySettings);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saved' | 'saving'>('idle');

  useEffect(() => {
    const privacySettings = getSetting('privacy_settings');
    if (privacySettings) {
      try {
        setSettings(JSON.parse(privacySettings));
      } catch (e) {
        console.error('Error parsing privacy settings:', e);
      }
    }
  }, [getSetting]);

  const handleToggle = (key: keyof PrivacySettings, value: boolean) => {
    setSettings(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleSelectChange = (key: keyof PrivacySettings, value: string) => {
    setSettings(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const saveSettings = async () => {
    setSaveStatus('saving');
    try {
      await updateSetting.mutateAsync({
        type: 'privacy_settings',
        value: JSON.stringify(settings),
      });
      setSaveStatus('saved');
      setTimeout(() => setSaveStatus('idle'), 2000);
    } catch (error) {
      console.error('Error saving privacy settings:', error);
      setSaveStatus('idle');
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-semibold mb-2">Privacy Settings</h3>
        <p className="text-sm text-muted-foreground mb-4">
          Control who can see your profile and how your information is shared.
        </p>
      </div>

      <div className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="profileVisibility">Profile Visibility</Label>
          <Select 
            value={settings.profileVisibility}
            onValueChange={(value) => handleSelectChange('profileVisibility', value as 'public' | 'mentees' | 'private')}
          >
            <SelectTrigger id="profileVisibility">
              <SelectValue placeholder="Select visibility" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="public">Public - Anyone can find and view your profile</SelectItem>
              <SelectItem value="mentees">Mentees Only - Only connected mentees can view your full profile</SelectItem>
              <SelectItem value="private">Private - Your profile is hidden from search and listings</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center justify-between">
          <div>
            <Label htmlFor="shareAvailability" className="font-medium">Share Availability</Label>
            <p className="text-sm text-muted-foreground">
              Allow others to see your available time slots
            </p>
          </div>
          <Switch
            id="shareAvailability"
            checked={settings.shareAvailability}
            onCheckedChange={(value) => handleToggle('shareAvailability', value)}
          />
        </div>

        <div className="flex items-center justify-between">
          <div>
            <Label htmlFor="shareContactDetails" className="font-medium">Share Contact Details</Label>
            <p className="text-sm text-muted-foreground">
              Allow mentees to see your contact information (email, social links)
            </p>
          </div>
          <Switch
            id="shareContactDetails"
            checked={settings.shareContactDetails}
            onCheckedChange={(value) => handleToggle('shareContactDetails', value)}
          />
        </div>

        <div className="flex items-center justify-between">
          <div>
            <Label htmlFor="allowPublicBooking" className="font-medium">Allow Public Booking</Label>
            <p className="text-sm text-muted-foreground">
              Allow anyone to book sessions with you without prior connection
            </p>
          </div>
          <Switch
            id="allowPublicBooking"
            checked={settings.allowPublicBooking}
            onCheckedChange={(value) => handleToggle('allowPublicBooking', value)}
          />
        </div>

        <div className="flex items-center justify-between">
          <div>
            <Label htmlFor="allowMenteeReviews" className="font-medium">Allow Mentee Reviews</Label>
            <p className="text-sm text-muted-foreground">
              Allow mentees to leave public reviews after sessions
            </p>
          </div>
          <Switch
            id="allowMenteeReviews"
            checked={settings.allowMenteeReviews}
            onCheckedChange={(value) => handleToggle('allowMenteeReviews', value)}
          />
        </div>
      </div>

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
        ) : (
          'Save Privacy Settings'
        )}
      </Button>
    </div>
  );
}
