
import { AccessibilitySettings } from './types';

export const applyFontSettings = (settings: AccessibilitySettings) => {
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

export const getFontClassForPreview = (fontFamily: string): string => {
  switch (fontFamily) {
    case 'system': return 'font-sans';
    case 'serif': return 'font-serif';
    case 'sans-serif': return 'font-sans';
    case 'monospace': return 'font-mono';
    case 'inter': return 'font-inter';
    case 'roboto': return 'font-roboto';
    case 'poppins': return 'font-poppins';
    case 'comic': return 'font-comic';
    case 'open-dyslexic': return 'font-dyslexic';
    default: return '';
  }
};
