
"use client";

import * as React from "react";
import { ThemeProvider as NextThemesProvider } from "next-themes";
import { type ThemeProviderProps } from "next-themes/dist/types";
import { useEffect } from "react";
import { useUserProfile } from "@/hooks/useUserProfile";
import { useUserSettings } from "@/hooks/useUserSettings";
import { useAuth } from "@/context/AuthContext";

export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
  const { session } = useAuth();
  const { data: profile } = useUserProfile(session);
  const { getSetting } = profile?.id ? useUserSettings(profile?.id) : { getSetting: () => "" };
  
  // Apply font and accessibility settings
  useEffect(() => {
    if (!profile?.id) return;
    
    const accessibilitySettingsStr = getSetting('accessibility_settings');
    if (!accessibilitySettingsStr) return;
    
    try {
      const settings = JSON.parse(accessibilitySettingsStr);
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
      
      // Apply other accessibility settings
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
      
    } catch (e) {
      console.error('Error applying accessibility settings:', e);
    }
  }, [profile?.id, getSetting]);
  
  return <NextThemesProvider {...props}>{children}</NextThemesProvider>;
}
