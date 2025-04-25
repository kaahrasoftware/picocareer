
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
            .container { width: 100% !important; padding: 20px !important; }
            .header { padding: 24px !important; }
            .content { padding: 20px !important; }
            .footer { padding: 20px !important; }
          }
        </style>
      </head>
      <body style="font-family: Arial, sans-serif; margin: 0; padding: 0; background-color: #f9f9fb;">
        <div class="container" style="max-width: 600px; margin: 0 auto; padding: 40px 20px;">
          <!-- Header with Logo -->
          <div style="text-align: center; margin-bottom: 32px;">
            <img src="${siteUrl}/logo.png" alt="PicoCareer Logo" style="height: 40px; width: auto;">
          </div>
          
          <!-- Main Content -->
          ${content}
          
          <!-- Footer -->
          <div style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #e5e7eb; text-align: center;">
            <p style="color: #6b7280; font-size: 14px; line-height: 1.5; margin-bottom: 10px;">
              For more personalized recommendations and opportunities,
              <a href="${siteUrl}" style="color: #8B5CF6; text-decoration: none;">visit PicoCareer</a>
            </p>
            <p style="color: #6b7280; font-size: 12px; margin: 10px 0;">
              © ${currentYear} PicoCareer. All rights reserved.
            </p>
            <p style="color: #6b7280; font-size: 12px; margin: 10px 0;">
              <a href="${unsubscribeUrl}" style="color: #6b7280; text-decoration: underline;">
                Unsubscribe
              </a> from these emails
            </p>
          </div>
        </div>
      </body>
    </html>
  `;
}
