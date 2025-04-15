
import React from "react";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { AccessibilitySettings } from "./types";

interface NavigationSectionProps {
  settings: AccessibilitySettings;
  handleToggle: (key: keyof AccessibilitySettings, value: boolean) => void;
}

export function NavigationSection({ settings, handleToggle }: NavigationSectionProps) {
  return (
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
  );
}
