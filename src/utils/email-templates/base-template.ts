
/**
 * Generates the base email template with the given content
 */
export function generateBaseTemplate(
  mainContent: string,
  siteUrl: string,
  unsubscribeUrl: string,
  styles: { primary: string; secondary: string; accent: string },
  logoUrl?: string
): string {
  const currentYear = new Date().getFullYear();

  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>PicoCareer</title>
      </head>
      <body style="margin: 0; padding: 20px; background-color: #f9fafb; 
                   font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
        <div style="max-width: 600px; margin: 0 auto; background: white; border-radius: 8px; 
                    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1); overflow: hidden;">
          
          <!-- Header with logo -->
          <div style="text-align: center; padding: 24px; border-bottom: 1px solid #e5e7eb;">
            ${logoUrl ? `<img src="${logoUrl}" alt="Logo" style="height: 40px;">` : `
            <div style="font-size: 24px; font-weight: 700; color: ${styles.primary};">
              PicoCareer
            </div>
            `}
          </div>
          
          <!-- Main content -->
          ${mainContent}
          
          <!-- Footer -->
          <div style="background-color: #f9fafb; padding: 24px; text-align: center; border-top: 1px solid #e5e7eb;">
            <p style="margin: 0 0 16px 0; color: #4b5563;">
              Visit our website for more content tailored to your interests
            </p>
            <a 
              href="${siteUrl}" 
              style="display: inline-block; background-color: ${styles.accent}; color: white; 
                     padding: 12px 24px; text-decoration: none; border-radius: 6px; 
                     font-weight: 500;"
            >
              Visit PicoCareer
            </a>
          </div>

          <div style="padding: 24px; text-align: center; color: #6b7280; font-size: 14px;">
            <p style="margin: 0 0 8px 0;">© ${currentYear} PicoCareer. All rights reserved.</p>
            <a 
              href="${unsubscribeUrl}" 
              style="color: #6b7280; text-decoration: underline;"
            >
              Unsubscribe
            </a>
          </div>
        </div>
      </body>
    </html>
  `;
}
