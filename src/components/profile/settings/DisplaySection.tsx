
import React from 'react';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';

interface DisplaySectionProps {
  settings: any;
  handleToggle: (key: string) => void;
}

export function DisplaySection({ settings, handleToggle }: DisplaySectionProps) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="space-y-0.5">
          <Label htmlFor="high-contrast">High Contrast Mode</Label>
          <p className="text-sm text-muted-foreground">
            Increase color contrast for better visibility
          </p>
        </div>
        <Switch
          id="high-contrast"
          checked={settings?.highContrast || false}
          onCheckedChange={() => handleToggle('highContrast')}
        />
      </div>
      
      <div className="flex items-center justify-between">
        <div className="space-y-0.5">
          <Label htmlFor="large-text">Large Text</Label>
          <p className="text-sm text-muted-foreground">
            Increase text size for better readability
          </p>
        </div>
        <Switch
          id="large-text"
          checked={settings?.largeText || false}
          onCheckedChange={() => handleToggle('largeText')}
        />
      </div>
    </div>
  );
}
