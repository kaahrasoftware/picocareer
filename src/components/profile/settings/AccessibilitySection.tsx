import React, { useState, useEffect } from "react";
import { useUserSettings } from "@/hooks/useUserSettings";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Card, CardContent } from "@/components/ui/card";
import { CheckIcon } from "lucide-react";
interface AccessibilitySectionProps {
  profileId: string;
}
interface AccessibilitySettings {
  screenReaderOptimized: boolean;
  highContrast: boolean;
  reducedMotion: boolean;
  textToSpeech: boolean;
  keyboardNavigation: boolean;
  fontType: 'default' | 'dyslexic' | 'monospace';
  colorBlindMode: 'none' | 'protanopia' | 'deuteranopia' | 'tritanopia';
  zoomLevel: number;
}
const defaultAccessibilitySettings: AccessibilitySettings = {
  screenReaderOptimized: false,
  highContrast: false,
  reducedMotion: false,
  textToSpeech: false,
  keyboardNavigation: true,
  fontType: 'default',
  colorBlindMode: 'none',
  zoomLevel: 100
};
export function AccessibilitySection({
  profileId
}: AccessibilitySectionProps) {
  const {
    getSetting,
    updateSetting
  } = useUserSettings(profileId);
  const [settings, setSettings] = useState<AccessibilitySettings>(defaultAccessibilitySettings);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saved' | 'saving'>('idle');
  useEffect(() => {
    const accessibilitySettings = getSetting('accessibility_settings');
    if (accessibilitySettings) {
      try {
        setSettings(JSON.parse(accessibilitySettings));
      } catch (e) {
        console.error('Error parsing accessibility settings:', e);
      }
    }
  }, [getSetting]);
  const handleToggle = (key: keyof AccessibilitySettings, value: boolean) => {
    setSettings(prev => ({
      ...prev,
      [key]: value
    }));
  };
  const handleSelectChange = (key: keyof AccessibilitySettings, value: string) => {
    setSettings(prev => ({
      ...prev,
      [key]: value
    }));
  };
  const handleSliderChange = (value: number[]) => {
    setSettings(prev => ({
      ...prev,
      zoomLevel: value[0]
    }));
  };
  const saveSettings = async () => {
    setSaveStatus('saving');
    try {
      await updateSetting.mutateAsync({
        type: 'accessibility_settings',
        value: JSON.stringify(settings)
      });
      setSaveStatus('saved');
      setTimeout(() => setSaveStatus('idle'), 2000);
    } catch (error) {
      console.error('Error saving accessibility settings:', error);
      setSaveStatus('idle');
    }
  };
  return <div className="space-y-4">
      <div>
        <h3 className="text-lg font-semibold mb-2">Accessibility Settings</h3>
        <p className="text-sm text-muted-foreground mb-4">
          Customize your experience for better accessibility.
        </p>
      </div>

      <Card>
        <CardContent className="pt-6 space-y-6">
          

          

          

          

          

          <div className="space-y-2">
            <Label htmlFor="fontType">Font Type</Label>
            <Select value={settings.fontType} onValueChange={value => handleSelectChange('fontType', value as 'default' | 'dyslexic' | 'monospace')}>
              <SelectTrigger id="fontType">
                <SelectValue placeholder="Select font type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="default">Default</SelectItem>
                <SelectItem value="dyslexic">Dyslexic Friendly</SelectItem>
                <SelectItem value="monospace">Monospace</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="colorBlindMode">Color Blind Mode</Label>
            <Select value={settings.colorBlindMode} onValueChange={value => handleSelectChange('colorBlindMode', value as 'none' | 'protanopia' | 'deuteranopia' | 'tritanopia')}>
              <SelectTrigger id="colorBlindMode">
                <SelectValue placeholder="Select color blind mode" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">None</SelectItem>
                <SelectItem value="protanopia">Protanopia (Red-Blind)</SelectItem>
                <SelectItem value="deuteranopia">Deuteranopia (Green-Blind)</SelectItem>
                <SelectItem value="tritanopia">Tritanopia (Blue-Blind)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          
        </CardContent>
      </Card>

      <Button onClick={saveSettings} disabled={saveStatus === 'saving'} className="mt-4">
        {saveStatus === 'saving' ? 'Saving...' : saveStatus === 'saved' ? <>
            <CheckIcon className="h-4 w-4 mr-2" />
            Saved
          </> : 'Save Accessibility Settings'}
      </Button>
    </div>;
}