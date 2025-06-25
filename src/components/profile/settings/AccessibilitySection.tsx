
import React, { useState, useEffect } from "react";
import { useUserSettings } from "@/hooks/useUserSettings";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { CheckIcon } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { DisplaySection } from "./accessibility/DisplaySection";
import { TypographySection } from "./accessibility/TypographySection";
import { NavigationSection } from "./accessibility/NavigationSection";
import { AccessibilitySettings, defaultAccessibilitySettings, AccessibilitySectionProps } from "./accessibility/types";
import { applyFontSettings } from "./accessibility/utils";

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

  const saveSettings = async () => {
    setSaveStatus('saving');
    try {
      await updateSetting.mutateAsync({
        type: 'accessibility_settings',
        value: JSON.stringify(settings)
      });
      setSaveStatus('saved');
      setTimeout(() => setSaveStatus('idle'), 2000);
      applyFontSettings(settings);
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
          <DisplaySection 
            settings={settings} 
            handleToggle={handleToggle} 
          />
          
          <Separator />
          
          <TypographySection 
            settings={settings} 
            handleSelectChange={handleSelectChange} 
          />
          
          <Separator />
          
          <NavigationSection 
            settings={settings} 
            handleToggle={handleToggle} 
          />
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
