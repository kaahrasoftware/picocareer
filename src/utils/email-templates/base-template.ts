
export function generateBaseTemplate(content: string, siteUrl: string, unsubscribeUrl: string) {
  const currentYear = new Date().getFullYear();
  
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
          @media only screen and (max-width: 600px) {
            .container { width: 100% !important; }
            .header { padding: 20px !important; }
            .content { padding: 20px !important; }
            .footer { padding: 20px !important; }
          }
        </style>
      </head>
      <body style="margin: 0; padding: 0; background-color: #f9fafb; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
        <div class="container" style="max-width: 600px; margin: 0 auto; background: white; border-radius: 8px; margin-top: 20px; margin-bottom: 20px; box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1);">
          <!-- Header -->
          <div class="header" style="text-align: center; padding: 24px 40px; border-bottom: 1px solid #e5e7eb;">
            <img src="${siteUrl}/logo.png" alt="PicoCareer Logo" style="height: 32px; width: auto;">
          </div>
          
          <!-- Main Content -->
          <div class="content" style="padding: 32px 40px;">
            ${content}
          </div>
          
          <!-- Footer -->
          <div class="footer" style="padding: 24px 40px; background-color: #f9fafb; border-top: 1px solid #e5e7eb; text-align: center;">
            <p style="color: #6b7280; font-size: 14px; line-height: 1.5; margin: 0 0 16px 0;">
              Visit <a href="${siteUrl}" style="color: #8B5CF6; text-decoration: none;">PicoCareer</a> 
              to discover more opportunities tailored to your interests.
            </p>
            <p style="color: #9CA3AF; font-size: 12px; margin: 0 0 8px 0;">
              © ${currentYear} PicoCareer. All rights reserved.
            </p>
            <p style="color: #9CA3AF; font-size: 12px; margin: 0;">
              <a href="${unsubscribeUrl}" style="color: #9CA3AF; text-decoration: underline;">
                Unsubscribe
              </a>
            </p>
          </div>
        </div>
      </body>
    </html>
  `;
}
