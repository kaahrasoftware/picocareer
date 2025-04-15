
import React from "react";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AccessibilitySettings } from "./types";
import { getFontClassForPreview } from "./utils";

interface TypographySectionProps {
  settings: AccessibilitySettings;
  handleSelectChange: (key: keyof AccessibilitySettings, value: string) => void;
}

export function TypographySection({ settings, handleSelectChange }: TypographySectionProps) {
  return (
    <div className="space-y-4">
      <h4 className="font-medium">Typography</h4>
      
      <div className="space-y-2">
        <Label htmlFor="fontFamily">Font Family</Label>
        <Select 
          value={settings.fontFamily} 
          onValueChange={value => handleSelectChange('fontFamily', value as AccessibilitySettings['fontFamily'])}
        >
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
          <p className={`text-sm ${getFontClassForPreview(settings.fontFamily)}`}>
            The quick brown fox jumps over the lazy dog.
          </p>
        </div>
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
    </div>
  );
}
