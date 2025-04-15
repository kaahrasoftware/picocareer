
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
  fontSize: 'default' | 'large' | 'larger';
  fontFamily: 'system' | 'serif' | 'sans-serif' | 'rounded' | 'monospace';
}

const defaultAccessibilitySettings: AccessibilitySettings = {
  screenReaderOptimized: false,
  highContrast: false,
  reducedMotion: false,
  textToSpeech: false,
  keyboardNavigation: true,
  fontType: 'default',
  colorBlindMode: 'none',
  zoomLevel: 100,
  fontSize: 'default',
  fontFamily: 'system'
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
      
      // Apply font settings immediately
      applyFontSettings(settings);
    } catch (error) {
      console.error('Error saving accessibility settings:', error);
      setSaveStatus('idle');
    }
  };

  const applyFontSettings = (settings: AccessibilitySettings) => {
    const root = document.documentElement;
    
    // Apply font family
    let fontFamily = '';
    switch (settings.fontFamily) {
      case 'serif':
        fontFamily = 'Georgia, Times New Roman, serif';
        break;
      case 'sans-serif':
        fontFamily = 'Arial, Helvetica, sans-serif';
        break;
      case 'rounded':
        fontFamily = 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", sans-serif';
        break;
      case 'monospace':
        fontFamily = 'Consolas, Monaco, "Courier New", monospace';
        break;
      default:
        fontFamily = 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", sans-serif';
    }
    
    // Apply font size
    let fontSize = '1';
    switch (settings.fontSize) {
      case 'large':
        fontSize = '1.1';
        break;
      case 'larger':
        fontSize = '1.2';
        break;
      default:
        fontSize = '1';
    }
    
    // Set CSS variables
    root.style.setProperty('--font-family-override', fontFamily);
    root.style.setProperty('--font-size-scale', fontSize);
    
    // Set high contrast if enabled
    if (settings.highContrast) {
      document.body.classList.add('high-contrast');
    } else {
      document.body.classList.remove('high-contrast');
    }
    
    // Set reduced motion if enabled
    if (settings.reducedMotion) {
      document.body.classList.add('reduced-motion');
    } else {
      document.body.classList.remove('reduced-motion');
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
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="screenReader">Screen Reader Optimization</Label>
              <p className="text-sm text-muted-foreground">
                Optimize the interface for screen readers
              </p>
            </div>
            <Switch
              id="screenReader"
              checked={settings.screenReaderOptimized}
              onCheckedChange={(value) => handleToggle('screenReaderOptimized', value)}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="highContrast">High Contrast Mode</Label>
              <p className="text-sm text-muted-foreground">
                Increase contrast for better visibility
              </p>
            </div>
            <Switch
              id="highContrast"
              checked={settings.highContrast}
              onCheckedChange={(value) => handleToggle('highContrast', value)}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="reducedMotion">Reduced Motion</Label>
              <p className="text-sm text-muted-foreground">
                Minimize animations and transitions
              </p>
            </div>
            <Switch
              id="reducedMotion"
              checked={settings.reducedMotion}
              onCheckedChange={(value) => handleToggle('reducedMotion', value)}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="keyboardNavigation">Enhanced Keyboard Navigation</Label>
              <p className="text-sm text-muted-foreground">
                Improve keyboard focus indicators
              </p>
            </div>
            <Switch
              id="keyboardNavigation"
              checked={settings.keyboardNavigation}
              onCheckedChange={(value) => handleToggle('keyboardNavigation', value)}
            />
          </div>

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
            <Select 
              value={settings.colorBlindMode} 
              onValueChange={value => handleSelectChange('colorBlindMode', value as 'none' | 'protanopia' | 'deuteranopia' | 'tritanopia')}
            >
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

          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <Label htmlFor="zoomLevel">Zoom Level: {settings.zoomLevel}%</Label>
            </div>
            <Slider 
              id="zoomLevel"
              min={75}
              max={150}
              step={5}
              value={[settings.zoomLevel]} 
              onValueChange={handleSliderChange}
              className="w-full"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="fontFamily">Font Family</Label>
            <Select 
              value={settings.fontFamily} 
              onValueChange={value => handleSelectChange('fontFamily', value as 'system' | 'serif' | 'sans-serif' | 'rounded' | 'monospace')}
            >
              <SelectTrigger id="fontFamily">
                <SelectValue placeholder="Select font family" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="system">System Default</SelectItem>
                <SelectItem value="serif">Serif</SelectItem>
                <SelectItem value="sans-serif">Sans-Serif</SelectItem>
                <SelectItem value="rounded">Rounded</SelectItem>
                <SelectItem value="monospace">Monospace</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="fontSize">Font Size</Label>
            <Select 
              value={settings.fontSize} 
              onValueChange={value => handleSelectChange('fontSize', value as 'default' | 'large' | 'larger')}
            >
              <SelectTrigger id="fontSize">
                <SelectValue placeholder="Select font size" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="default">Default</SelectItem>
                <SelectItem value="large">Large (110%)</SelectItem>
                <SelectItem value="larger">Larger (120%)</SelectItem>
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
