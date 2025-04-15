
export interface AccessibilitySettings {
  screenReaderOptimized: boolean;
  highContrast: boolean;
  reducedMotion: boolean;
  textToSpeech: boolean;
  keyboardNavigation: boolean;
  fontType: 'default' | 'dyslexic' | 'monospace';
  colorBlindMode: 'none' | 'protanopia' | 'deuteranopia' | 'tritanopia';
  zoomLevel: number;
  fontSize: 'default' | 'large' | 'larger';
  fontFamily: 'system' | 'serif' | 'sans-serif' | 'rounded' | 'monospace' | 'inter' | 'roboto' | 'poppins' | 'comic' | 'open-dyslexic';
}

export const defaultAccessibilitySettings: AccessibilitySettings = {
  screenReaderOptimized: false,
  highContrast: false,
  reducedMotion: false,
  textToSpeech: false,
  keyboardNavigation: true,
  fontType: 'default',
  colorBlindMode: 'none',
  zoomLevel: 100,
  fontSize: 'default',
  fontFamily: 'system'
};

export interface AccessibilitySectionProps {
  profileId: string;
}
