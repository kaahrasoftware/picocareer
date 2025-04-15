
import React from "react";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { AccessibilitySettings } from "./types";

interface DisplaySectionProps {
  settings: AccessibilitySettings;
  handleToggle: (key: keyof AccessibilitySettings, value: boolean) => void;
}

export function DisplaySection({ settings, handleToggle }: DisplaySectionProps) {
  return (
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
  );
}
