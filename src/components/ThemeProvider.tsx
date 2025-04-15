
"use client";

import * as React from "react";
import { ThemeProvider as NextThemesProvider } from "next-themes";
import { type ThemeProviderProps } from "next-themes/dist/types";
import { useEffect } from "react";
import { useUserProfile } from "@/hooks/useUserProfile";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/integrations/supabase/client";

export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
  const { session } = useAuth();
  const { data: profile } = useUserProfile(session);
  const [accessibilitySettings, setAccessibilitySettings] = React.useState<any>(null);
  
  // Fetch settings directly without using useUserSettings to avoid hook dependencies
  useEffect(() => {
    if (!profile?.id) return;
    
    const fetchSettings = async () => {
      try {
        const { data, error } = await supabase
          .from('user_settings')
          .select('setting_value')
          .eq('profile_id', profile.id)
          .eq('setting_type', 'accessibility_settings')
          .single();
        
        if (error) {
          console.error('Error fetching accessibility settings:', error);
          return;
        }
        
        if (data?.setting_value) {
          setAccessibilitySettings(JSON.parse(data.setting_value));
        }
      } catch (e) {
        console.error('Error parsing accessibility settings:', e);
      }
    };
    
    fetchSettings();
  }, [profile?.id]);
  
  // Apply font and accessibility settings
  useEffect(() => {
    if (!accessibilitySettings) return;
    
    try {
      const settings = accessibilitySettings;
      const root = document.documentElement;
      
      // Apply font family
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
  }, [accessibilitySettings]);
  
  return <NextThemesProvider {...props}>{children}</NextThemesProvider>;
}
