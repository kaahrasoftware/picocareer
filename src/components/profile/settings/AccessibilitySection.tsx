
import React from 'react';
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useUserSettings } from "@/hooks/useUserSettings";

interface AccessibilitySectionProps {
  profileId: string;
}

interface AccessibilitySettings {
  highContrast: boolean;
  fontSize: string;
  screenReader: boolean;
  reduceMotion: boolean;
  keyboardNavigation: boolean;
}

interface DisplaySectionProps {
  settings: AccessibilitySettings;
  handleToggle: (key: keyof AccessibilitySettings) => void;
  handleFontSizeChange: (size: string) => void;
}

const DisplaySection = ({ settings, handleToggle, handleFontSizeChange }: DisplaySectionProps): JSX.Element => {
  return (
    <div className="space-y-4">
      <h4 className="font-medium">Display Settings</h4>
      
      <div className="flex items-center justify-between">
        <Label htmlFor="high-contrast">High Contrast Mode</Label>
        <Switch
          id="high-contrast"
          checked={settings.highContrast}
          onCheckedChange={() => handleToggle('highContrast')}
        />
      </div>

      <div className="flex items-center justify-between">
        <Label htmlFor="reduce-motion">Reduce Motion</Label>
        <Switch
          id="reduce-motion"
          checked={settings.reduceMotion}
          onCheckedChange={() => handleToggle('reduceMotion')}
        />
      </div>

      <div className="space-y-2">
        <Label>Font Size</Label>
        <Select value={settings.fontSize} onValueChange={handleFontSizeChange}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="small">Small</SelectItem>
            <SelectItem value="medium">Medium</SelectItem>
            <SelectItem value="large">Large</SelectItem>
            <SelectItem value="extra-large">Extra Large</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
};

export function AccessibilitySection({ profileId }: AccessibilitySectionProps) {
  const { getSetting, updateSetting } = useUserSettings(profileId);

  const getAccessibilitySettings = (): AccessibilitySettings => {
    const settingsStr = getSetting('accessibility_settings');
    if (settingsStr) {
      try {
        return JSON.parse(settingsStr);
      } catch (error) {
        console.error('Error parsing accessibility settings:', error);
      }
    }
    
    return {
      highContrast: false,
      fontSize: 'medium',
      screenReader: false,
      reduceMotion: false,
      keyboardNavigation: true,
    };
  };

  const [settings, setSettings] = React.useState<AccessibilitySettings>(getAccessibilitySettings);

  const handleToggle = (key: keyof AccessibilitySettings) => {
    setSettings(prev => {
      const newSettings = { ...prev, [key]: !prev[key] };
      updateSetting.mutate({
        type: 'accessibility_settings',
        value: JSON.stringify(newSettings)
      });
      return newSettings;
    });
  };

  const handleFontSizeChange = (size: string) => {
    setSettings(prev => {
      const newSettings = { ...prev, fontSize: size };
      updateSetting.mutate({
        type: 'accessibility_settings',
        value: JSON.stringify(newSettings)
      });
      return newSettings;
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-4">Accessibility Settings</h3>
        <p className="text-sm text-muted-foreground mb-6">
          Customize your experience to better suit your accessibility needs.
        </p>
      </div>

      <DisplaySection 
        settings={settings} 
        handleToggle={handleToggle}
        handleFontSizeChange={handleFontSizeChange}
      />
    </div>
  );
}
