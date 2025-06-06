
/**
 * Generates the email header with specified style
 */
export function generateHeader(
  title: string,
  headerStyle: string = 'centered',
  colors: { primary: string; secondary: string; accent: string },
  logoUrl?: string
): string {
  switch (headerStyle) {
    case 'banner':
      return `
        <div style="background: linear-gradient(135deg, ${colors.primary}, ${colors.secondary}); color: white; padding: 32px; text-align: center; margin-bottom: 24px;">
          ${logoUrl ? `<img src="${logoUrl}" alt="Logo" style="height: 40px; margin-bottom: 16px;">` : ''}
          <h1 style="margin: 0; font-size: 28px; font-weight: 600;">${title}</h1>
        </div>
      `;
      
    case 'minimal':
      return `
        <div style="padding: 24px; margin-bottom: 24px;">
          ${logoUrl ? `<img src="${logoUrl}" alt="Logo" style="height: 32px; margin-bottom: 16px;">` : ''}
          <h1 style="margin: 0; font-size: 24px; font-weight: 600; color: ${colors.primary};">${title}</h1>
          <div style="width: 50px; height: 3px; background-color: ${colors.accent}; margin-top: 12px;"></div>
        </div>
      `;
      
    case 'centered':
    default:
      return `
        <div style="text-align: center; padding: 24px; margin-bottom: 24px;">
          ${logoUrl ? `<img src="${logoUrl}" alt="Logo" style="height: 40px; margin-bottom: 16px;">` : ''}
          <h1 style="margin: 0; font-size: 26px; font-weight: 600; color: ${colors.primary};">${title}</h1>
        </div>
      `;
  }
}
