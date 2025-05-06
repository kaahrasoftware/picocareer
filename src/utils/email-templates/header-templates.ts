
/**
 * Generates email header section based on style and settings
 */
export function generateHeader(
  title: string,
  headerStyle: 'centered' | 'banner' | 'minimal',
  styles: { primary: string; secondary: string; accent: string },
  logoUrl?: string
): string {
  switch (headerStyle) {
    case 'banner':
      return `
        <div style="background: linear-gradient(135deg, ${styles.primary}, ${styles.secondary}); color: white; padding: 32px; text-align: center; margin-bottom: 24px;">
          ${logoUrl ? `<img src="${logoUrl}" alt="Logo" style="height: 40px; margin-bottom: 16px;">` : ''}
          <h1 style="margin: 0; font-size: 28px; font-weight: 600;">${title}</h1>
        </div>
      `;
      
    case 'minimal':
      return `
        <div style="padding: 24px; margin-bottom: 24px;">
          ${logoUrl ? `<img src="${logoUrl}" alt="Logo" style="height: 32px; margin-bottom: 16px;">` : ''}
          <h1 style="margin: 0; font-size: 24px; font-weight: 600; color: ${styles.primary};">${title}</h1>
          <div style="width: 50px; height: 3px; background-color: ${styles.accent}; margin-top: 12px;"></div>
        </div>
      `;
      
    case 'centered':
    default:
      return `
        <div style="text-align: center; padding: 24px; margin-bottom: 24px;">
          ${logoUrl ? `<img src="${logoUrl}" alt="Logo" style="height: 40px; margin-bottom: 16px;">` : ''}
          <h1 style="margin: 0; font-size: 26px; font-weight: 600; color: ${styles.primary};">${title}</h1>
        </div>
      `;
  }
}
