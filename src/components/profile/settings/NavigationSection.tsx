
import React from 'react';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';

interface NavigationSectionProps {
  settings: any;
  handleToggle: (key: string) => void;
}

export function NavigationSection({ settings, handleToggle }: NavigationSectionProps) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="space-y-0.5">
          <Label htmlFor="keyboard-navigation">Enhanced Keyboard Navigation</Label>
          <p className="text-sm text-muted-foreground">
            Improve keyboard accessibility features
          </p>
        </div>
        <Switch
          id="keyboard-navigation"
          checked={settings?.keyboardNavigation || false}
          onCheckedChange={() => handleToggle('keyboardNavigation')}
        />
      </div>
      
      <div className="flex items-center justify-between">
        <div className="space-y-0.5">
          <Label htmlFor="focus-indicators">Enhanced Focus Indicators</Label>
          <p className="text-sm text-muted-foreground">
            Make focus indicators more visible
          </p>
        </div>
        <Switch
          id="focus-indicators"
          checked={settings?.focusIndicators || false}
          onCheckedChange={() => handleToggle('focusIndicators')}
        />
      </div>
    </div>
  );
}
