
import type { ContentItem } from "../../../src/types/database/email";
import { getContentTypeStyles } from "./styles";
import { formatContentCard } from "./content-cards";

export const CONTENT_TYPE_LABELS: Record<string, string> = {
  scholarships: "Scholarship Spotlight",
  opportunities: "Opportunity Spotlight",
  careers: "Career Spotlight",
  majors: "Major Spotlight",
  schools: "School Spotlight",
  mentors: "Mentor Spotlight",
  blogs: "Blog Spotlight",
};

export function generateEmailContent(
  title: string,
  body: string,
  recipientName: string = 'Valued Member',
  campaignId: string,
  contentItems: ContentItem[],
  contentType: string,
  siteUrl: string
): string {
  const styles = getContentTypeStyles(contentType);
  const unsubscribeUrl = `${siteUrl}/unsubscribe?campaign=${campaignId}`;
  const currentYear = new Date().getFullYear();

  let contentCardsHtml = '';
  if (contentItems && contentItems.length > 0) {
    contentItems.forEach(item => {
      contentCardsHtml += formatContentCard(item, contentType, siteUrl);
    });
  } else {
    contentCardsHtml = '<p style="text-align: center; padding: 20px; color: #6b7280;">No items to display.</p>';
  }

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>${title}</title>
    </head>
    <body style="font-family: Arial, sans-serif; margin: 0; padding: 0; background-color: #f9f9fb;">
      <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="${styles.gradient}; color: white; padding: 24px; border-radius: 12px; margin-bottom: 24px; text-align: center;">
          <div style="font-size: 32px; margin-bottom: 8px;">${styles.icon}</div>
          <h1 style="margin: 0; font-size: 24px;">${title}</h1>
        </div>
        
        <p style="margin-top: 0; color: #374151; font-size: 16px;">Hello ${recipientName},</p>
        
        <div style="margin: 20px 0; color: #374151; font-size: 16px;">
          ${body}
        </div>
        
        <div style="margin: 30px 0;">
          ${contentCardsHtml}
        </div>
        
        <div style="background-color: #f3f4f6; padding: 16px; border-radius: 8px; margin-top: 30px; text-align: center;">
          <p style="margin-top: 0; color: #4b5563;">
            Visit <a href="${siteUrl}" style="color: ${styles.accent}; text-decoration: none; font-weight: bold;">PicoCareer</a> 
            to discover more opportunities tailored to your interests.
          </p>
        </div>
        
        <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb; text-align: center;">
          <p style="color: #6b7280; font-size: 12px;">&copy; ${currentYear} PicoCareer. All rights reserved.</p>
          <p style="color: #6b7280; font-size: 12px;">
            <a href="${unsubscribeUrl}" style="color: #6b7280; text-decoration: underline;">Unsubscribe</a> from these emails
          </p>
        </div>
      </div>
    </body>
    </html>
  `;
}

export { getEmailSubject, getContentTypeStyles };
