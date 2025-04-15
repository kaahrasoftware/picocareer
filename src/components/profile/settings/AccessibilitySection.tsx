
import React, { useState, useEffect } from "react";
import { useUserSettings } from "@/hooks/useUserSettings";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Card, CardContent } from "@/components/ui/card";
import { CheckIcon } from "lucide-react";
import { Separator } from "@/components/ui/separator";

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
  fontFamily: 'system' | 'serif' | 'sans-serif' | 'rounded' | 'monospace' | 'inter' | 'roboto' | 'poppins' | 'comic' | 'open-dyslexic';
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
      applyFontSettings(settings);
    } catch (error) {
      console.error('Error saving accessibility settings:', error);
      setSaveStatus('idle');
    }
  };

  const applyFontSettings = (settings: AccessibilitySettings) => {
    const root = document.documentElement;
    let fontFamily = '';
    
    switch (settings.fontFamily) {
      // System & standard fonts
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
        
      // Modern web fonts
      case 'inter':
        fontFamily = '"Inter", system-ui, sans-serif';
        break;
      case 'roboto':
        fontFamily = '"Roboto", Arial, sans-serif';
        break;
      case 'poppins':
        fontFamily = '"Poppins", system-ui, sans-serif';
        break;
      case 'comic':
        fontFamily = '"Comic Sans MS", "Comic Sans", cursive';
        break;
      case 'open-dyslexic':
        fontFamily = '"OpenDyslexic", "Comic Sans MS", sans-serif';
        break;
        
      // Default system font
      default:
        fontFamily = 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", sans-serif';
    }
    
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
    
    root.style.setProperty('--font-family-override', fontFamily);
    root.style.setProperty('--font-size-scale', fontSize);
    
    if (settings.highContrast) {
      document.body.classList.add('high-contrast');
    } else {
      document.body.classList.remove('high-contrast');
    }
    
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
          <div className="space-y-4">
            <h4 className="font-medium">Display & Visibility</h4>
            
            <div className="flex items-center justify-between">
              <Label htmlFor="highContrast" className="flex-1">High Contrast Mode</Label>
              <Switch 
                id="highContrast" 
                checked={settings.highContrast} 
                onCheckedChange={(checked) => handleToggle('highContrast', checked)}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <Label htmlFor="reducedMotion" className="flex-1">Reduced Motion</Label>
              <Switch 
                id="reducedMotion" 
                checked={settings.reducedMotion} 
                onCheckedChange={(checked) => handleToggle('reducedMotion', checked)}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <Label htmlFor="screenReaderOptimized" className="flex-1">Screen Reader Optimized</Label>
              <Switch 
                id="screenReaderOptimized" 
                checked={settings.screenReaderOptimized} 
                onCheckedChange={(checked) => handleToggle('screenReaderOptimized', checked)}
              />
            </div>
          </div>
          
          <Separator />
          
          <div className="space-y-4">
            <h4 className="font-medium">Typography</h4>
            
            <div className="space-y-2">
              <Label htmlFor="fontFamily">Font Family</Label>
              <Select value={settings.fontFamily} onValueChange={value => handleSelectChange('fontFamily', value as AccessibilitySettings['fontFamily'])}>
                <SelectTrigger id="fontFamily">
                  <SelectValue placeholder="Select font family" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectLabel>System Fonts</SelectLabel>
                    <SelectItem value="system">
                      <span className="font-sans">System Default</span>
                    </SelectItem>
                    <SelectItem value="serif">
                      <span className="font-serif">Serif</span>
                    </SelectItem>
                    <SelectItem value="sans-serif">
                      <span className="font-sans">Sans-Serif</span>
                    </SelectItem>
                    <SelectItem value="monospace">
                      <span className="font-mono">Monospace</span>
                    </SelectItem>
                  </SelectGroup>
                  
                  <SelectGroup>
                    <SelectLabel>Web Fonts</SelectLabel>
                    <SelectItem value="inter">
                      <span className="font-inter">Inter</span>
                    </SelectItem>
                    <SelectItem value="roboto">
                      <span className="font-roboto">Roboto</span>
                    </SelectItem>
                    <SelectItem value="poppins">
                      <span className="font-poppins">Poppins</span>
                    </SelectItem>
                  </SelectGroup>
                  
                  <SelectGroup>
                    <SelectLabel>Accessibility Fonts</SelectLabel>
                    <SelectItem value="comic">
                      <span className="font-comic">Comic Sans</span>
                    </SelectItem>
                    <SelectItem value="open-dyslexic">
                      <span className="font-dyslexic">OpenDyslexic</span>
                    </SelectItem>
                  </SelectGroup>
                </SelectContent>
              </Select>
              
              <div className="bg-muted/50 p-3 rounded-md mt-2">
                <p className={`text-sm ${settings.fontFamily === 'system' ? 'font-sans' : 
                  settings.fontFamily === 'serif' ? 'font-serif' : 
                  settings.fontFamily === 'sans-serif' ? 'font-sans' : 
                  settings.fontFamily === 'monospace' ? 'font-mono' : 
                  settings.fontFamily === 'inter' ? 'font-inter' : 
                  settings.fontFamily === 'roboto' ? 'font-roboto' : 
                  settings.fontFamily === 'poppins' ? 'font-poppins' : 
                  settings.fontFamily === 'comic' ? 'font-comic' : 
                  settings.fontFamily === 'open-dyslexic' ? 'font-dyslexic' : ''
                }`}>
                  The quick brown fox jumps over the lazy dog.
                </p>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="fontSize">Font Size</Label>
              <Select value={settings.fontSize} onValueChange={value => handleSelectChange('fontSize', value as 'default' | 'large' | 'larger')}>
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
          </div>
          
          <Separator />
          
          <div className="space-y-4">
            <h4 className="font-medium">Input & Navigation</h4>
            
            <div className="flex items-center justify-between">
              <Label htmlFor="keyboardNavigation" className="flex-1">Enhanced Keyboard Navigation</Label>
              <Switch 
                id="keyboardNavigation" 
                checked={settings.keyboardNavigation} 
                onCheckedChange={(checked) => handleToggle('keyboardNavigation', checked)}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <Label htmlFor="textToSpeech" className="flex-1">Text to Speech</Label>
              <Switch 
                id="textToSpeech" 
                checked={settings.textToSpeech} 
                onCheckedChange={(checked) => handleToggle('textToSpeech', checked)}
              />
            </div>
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
