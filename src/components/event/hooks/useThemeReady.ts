
import { useEffect, useState } from 'react';
import { useTheme } from 'next-themes';

export function useThemeReady() {
  const [isReady, setIsReady] = useState(false);
  const { theme, systemTheme } = useTheme();
  
  useEffect(() => {
    // Check if theme is mounted and resolved
    const checkTheme = () => {
      const currentTheme = theme === 'system' ? systemTheme : theme;
      if (currentTheme !== undefined) {
        setIsReady(true);
      }
    };
    
    // Check immediately
    checkTheme();
    
    // Also check after a small delay to ensure CSS is applied
    const timeout = setTimeout(checkTheme, 100);
    
    return () => clearTimeout(timeout);
  }, [theme, systemTheme]);
  
  return isReady;
}
