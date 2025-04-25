
import { ContentItem } from "@/types/database/email";
import { getContentTypeStyles } from "./email-templates/styles";
import { formatContentCard } from "./email-templates/content-cards";

function calculateTotalAmount(contentItems: ContentItem[]): string {
  const total = contentItems.reduce((sum, item) => {
    const amount = typeof item.amount === 'number' ? item.amount : 0;
    return sum + amount;
  }, 0);
  return total.toLocaleString('en-US', { style: 'currency', currency: 'USD' });
}

export function getEmailSubject(contentType: string, firstName: string = ''): string {
  const nameSection = firstName ? `${firstName}, ` : '';
  
  switch (contentType) {
    case 'scholarships':
      return `🎓 ${nameSection}Your Personalized Scholarship Opportunities Await!`;
    case 'opportunities':
      return `🚀 Exclusive Career Opportunities Selected for You, ${nameSection}`;
    case 'careers':
      return `💼 Discover Your Next Career Move, ${nameSection}`;
    case 'majors':
      return `📚 Explore These Academic Paths, ${nameSection}`;
    case 'schools':
      return `🏛️ Top Educational Institutions for You, ${nameSection}`;
    case 'mentors':
      return `👋 Meet Your Potential Mentors, ${nameSection}`;
    case 'blogs':
      return `📖 Fresh Insights Curated for You, ${nameSection}`;
    default:
      return `New Content Updates for You, ${nameSection}`;
  }
}

export function generateEmailContent(
  title: string,
  body: string,
  recipientName: string = '',
  campaignId: string,
  contentItems: ContentItem[],
  contentType: string,
  siteUrl: string
): string {
  const styles = getContentTypeStyles(contentType);
  const unsubscribeUrl = `${siteUrl}/unsubscribe?campaign=${campaignId}`;
  const currentYear = new Date().getFullYear();
  const firstName = recipientName.split(' ')[0] || 'there';
  const totalAmount = calculateTotalAmount(contentItems);

  let contentCardsHtml = '';
  if (contentItems && contentItems.length > 0) {
    contentCardsHtml = contentItems.map(item => formatContentCard(item, contentType, siteUrl)).join('');
  } else {
    contentCardsHtml = '<p style="text-align: center; padding: 20px; color: #6b7280;">No scholarships available at this time.</p>';
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
      <div style="max-width: 600px; margin: 0 auto; padding: 24px;">
        <div style="${styles.gradient}; color: white; padding: 32px; border-radius: 16px; margin-bottom: 32px; text-align: center;">
          <div style="font-size: 48px; margin-bottom: 16px;">${styles.icon}</div>
          <h1 style="margin: 0; font-size: 32px; font-weight: 700;">Exclusive Scholarship Opportunities</h1>
          ${totalAmount !== '$0' ? `
            <p style="margin: 16px 0 0 0; font-size: 20px;">
              Worth ${totalAmount} in Total Funding
            </p>
          ` : ''}
        </div>
        
        <p style="margin-top: 0; margin-bottom: 24px; color: #374151; font-size: 18px; line-height: 1.5;">
          Hi ${firstName},<br><br>
          We've found some exciting scholarship opportunities that match your profile! These scholarships could help fund your education and bring you closer to achieving your academic goals.
        </p>
        
        <div style="margin: 32px 0;">
          ${contentCardsHtml}
        </div>
        
        <div style="background-color: #f3f4f6; padding: 24px; border-radius: 12px; margin-top: 40px; text-align: center;">
          <p style="margin-top: 0; margin-bottom: 0; color: #4b5563; font-size: 16px;">
            Visit <a href="${siteUrl}" style="color: ${styles.accent}; text-decoration: none; font-weight: 600;">PicoCareer</a> 
            to discover more scholarship opportunities tailored to your interests.
          </p>
        </div>
        
        <div style="margin-top: 40px; padding-top: 24px; border-top: 1px solid #e5e7eb; text-align: center;">
          <p style="color: #6b7280; font-size: 14px; margin-bottom: 8px;">&copy; ${currentYear} PicoCareer. All rights reserved.</p>
          <p style="color: #6b7280; font-size: 14px; margin-top: 0;">
            <a href="${unsubscribeUrl}" style="color: #6b7280; text-decoration: underline;">Unsubscribe</a> from these emails
          </p>
        </div>
      </div>
    </body>
    </html>
  `;
}

export { getContentTypeStyles };
