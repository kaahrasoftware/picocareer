
import React, { useState, useEffect } from "react";
import { useUserSettings } from "@/hooks/useUserSettings";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Card, CardContent } from "@/components/ui/card";
import { CheckIcon } from "lucide-react";

interface DisplaySectionProps {
  profileId: string;
}

interface DisplaySettings {
  theme: 'light' | 'dark' | 'system';
  fontSize: 'small' | 'medium' | 'large';
  compactMode: boolean;
  fontSizeValue: number;
  reduceAnimations: boolean;
  contrastMode: 'default' | 'high';
}

const defaultDisplaySettings: DisplaySettings = {
  theme: 'system',
  fontSize: 'medium',
  compactMode: false,
  fontSizeValue: 16,
  reduceAnimations: false,
  contrastMode: 'default',
};

export function DisplaySection({ profileId }: DisplaySectionProps) {
  const { getSetting, updateSetting } = useUserSettings(profileId);
  const [settings, setSettings] = useState<DisplaySettings>(defaultDisplaySettings);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saved' | 'saving'>('idle');

  useEffect(() => {
    const displaySettings = getSetting('display_settings');
    if (displaySettings) {
      try {
        setSettings(JSON.parse(displaySettings));
      } catch (e) {
        console.error('Error parsing display settings:', e);
      }
    }
  }, [getSetting]);

  const handleToggle = (key: keyof DisplaySettings, value: boolean) => {
    setSettings(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleSelectChange = (key: keyof DisplaySettings, value: string) => {
    setSettings(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleSliderChange = (value: number[]) => {
    setSettings(prev => ({
      ...prev,
      fontSizeValue: value[0]
    }));
  };

  const saveSettings = async () => {
    setSaveStatus('saving');
    try {
      await updateSetting.mutateAsync({
        type: 'display_settings',
        value: JSON.stringify(settings),
      });
      setSaveStatus('saved');
      setTimeout(() => setSaveStatus('idle'), 2000);
    } catch (error) {
      console.error('Error saving display settings:', error);
      setSaveStatus('idle');
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-semibold mb-2">Display Settings</h3>
        <p className="text-sm text-muted-foreground mb-4">
          Customize the appearance of the platform.
        </p>
      </div>

      <Card>
        <CardContent className="pt-6 space-y-6">
          <div className="space-y-3">
            <Label>Theme</Label>
            <RadioGroup 
              value={settings.theme} 
              onValueChange={(value) => handleSelectChange('theme', value as 'light' | 'dark' | 'system')}
              className="flex space-x-4"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="light" id="light" />
                <Label htmlFor="light">Light</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="dark" id="dark" />
                <Label htmlFor="dark">Dark</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="system" id="system" />
                <Label htmlFor="system">System</Label>
              </div>
            </RadioGroup>
          </div>

          <div className="space-y-3">
            <div className="flex justify-between">
              <Label htmlFor="font-size">Font Size ({settings.fontSizeValue}px)</Label>
            </div>
            <Slider
              id="font-size"
              min={12}
              max={24}
              step={1}
              value={[settings.fontSizeValue]}
              onValueChange={handleSliderChange}
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Small</span>
              <span>Medium</span>
              <span>Large</span>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="compactMode" className="font-medium">Compact Mode</Label>
              <p className="text-sm text-muted-foreground">
                Reduce spacing and show more content
              </p>
            </div>
            <Switch
              id="compactMode"
              checked={settings.compactMode}
              onCheckedChange={(value) => handleToggle('compactMode', value)}
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="reduceAnimations" className="font-medium">Reduce Animations</Label>
              <p className="text-sm text-muted-foreground">
                Minimize motion effects throughout the interface
              </p>
            </div>
            <Switch
              id="reduceAnimations"
              checked={settings.reduceAnimations}
              onCheckedChange={(value) => handleToggle('reduceAnimations', value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="contrastMode">Contrast Mode</Label>
            <Select 
              value={settings.contrastMode}
              onValueChange={(value) => handleSelectChange('contrastMode', value as 'default' | 'high')}
            >
              <SelectTrigger id="contrastMode">
                <SelectValue placeholder="Select contrast mode" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="default">Default</SelectItem>
                <SelectItem value="high">High Contrast</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

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
          'Save Display Settings'
        )}
      </Button>
    </div>
  );
}
