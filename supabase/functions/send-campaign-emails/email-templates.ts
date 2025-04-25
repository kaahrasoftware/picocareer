
import { ContentItem } from "../../../src/types/database/email";
import { getContentTypeStyles } from "./styles";

function calculateTotalAmount(contentItems: ContentItem[]): string {
  const total = contentItems.reduce((sum, item) => {
    const amount = typeof item.amount === 'number' ? item.amount : 0;
    return sum + amount;
  }, 0);
  return total.toLocaleString('en-US', { style: 'currency', currency: 'USD' });
}

export function formatContentCard(content: ContentItem, contentType: string, siteUrl: string): string {
  if (!content) return '';
  
  const styles = getContentTypeStyles(contentType);
  const contentUrl = `${siteUrl}/${contentType}/${content.id}`;
  const description = content.description?.slice(0, 300) + (content.description?.length > 300 ? '...' : '');

  return `
    <div style="margin-bottom: 24px; border: 1px solid #e5e7eb; border-radius: 12px; overflow: hidden; background-color: white; box-shadow: 0 2px 4px rgba(0,0,0,0.05);">
      <div style="padding: 24px;">
        ${content.cover_image_url ? `
          <img 
            src="${content.cover_image_url}" 
            alt="${content.title || 'Content'}"
            style="width: 100%; height: auto; border-radius: 8px; margin-bottom: 16px; max-width: 600px;"
          />
        ` : ''}
        
        <h2 style="margin: 0 0 16px 0; font-size: 24px; color: ${styles.accent};">
          ${content.title}
        </h2>

        ${description ? `
          <div style="color: #4b5563; margin: 16px 0; font-size: 16px; line-height: 1.6;">
            ${description}
          </div>
        ` : ''}

        ${content.provider_name ? `
          <div style="margin-bottom: 12px; padding: 8px 12px; background-color: #f9fafb; border-radius: 6px;">
            <span style="font-weight: 600; color: #374151;">Provider:</span>
            <span style="color: #4b5563;"> ${content.provider_name}</span>
          </div>
        ` : ''}

        ${typeof content.amount !== 'undefined' ? `
          <div style="margin-bottom: 12px; padding: 8px 12px; background-color: #f9fafb; border-radius: 6px;">
            <span style="font-weight: 600; color: #374151;">Amount:</span>
            <span style="font-weight: 600; color: #16a34a;"> ${typeof content.amount === 'number' 
              ? content.amount.toLocaleString('en-US', { style: 'currency', currency: 'USD' })
              : content.amount}</span>
          </div>
        ` : ''}

        ${content.deadline ? `
          <div style="margin-bottom: 12px; padding: 8px 12px; background-color: #f9fafb; border-radius: 6px;">
            <span style="font-weight: 600; color: #374151;">Deadline:</span>
            <span style="font-weight: 600; color: #dc2626;"> ${new Date(content.deadline).toLocaleDateString('en-US', { 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}</span>
          </div>
        ` : ''}

        <div style="margin-top: 24px;">
          <a 
            href="${contentUrl}" 
            style="display: inline-block; ${styles.gradient}; color: white; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: 500; text-align: center;"
          >
            Apply Now →
          </a>
        </div>
      </div>
    </div>
  `;
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
    contentCardsHtml = '<p style="text-align: center; padding: 20px; color: #6b7280;">No content available at this time.</p>';
  }

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>${title}</title>
      <style>
        @media only screen and (max-width: 600px) {
          .container { width: 100% !important; padding: 16px !important; }
          .header { padding: 24px !important; }
          .header h1 { font-size: 24px !important; }
          .content { padding: 16px !important; }
        }
      </style>
    </head>
    <body style="font-family: Arial, sans-serif; margin: 0; padding: 0; background-color: #f9f9fb;">
      <div class="container" style="max-width: 600px; margin: 0 auto; padding: 24px;">
        <div class="header" style="${styles.gradient}; color: white; padding: 32px; border-radius: 16px; margin-bottom: 32px; text-align: center;">
          <div style="font-size: 48px; margin-bottom: 16px;">${styles.icon}</div>
          <h1 style="margin: 0; font-size: 32px; font-weight: 700;">${title}</h1>
          ${totalAmount !== '$0' ? `
            <p style="margin: 16px 0 0 0; font-size: 20px;">
              Worth ${totalAmount} in Total Funding
            </p>
          ` : ''}
        </div>
        
        <div class="content" style="background-color: white; border-radius: 12px; padding: 24px; margin-bottom: 24px; box-shadow: 0 2px 4px rgba(0,0,0,0.05);">
          <p style="margin-top: 0; margin-bottom: 24px; color: #374151; font-size: 18px; line-height: 1.5;">
            Hi ${firstName},<br><br>
            We've found some exciting opportunities that match your profile! Take a look at these carefully selected items that could help you achieve your goals.
          </p>
          
          <div style="margin: 32px 0;">
            ${contentCardsHtml}
          </div>
        </div>
        
        <div style="background-color: #f3f4f6; padding: 24px; border-radius: 12px; margin-top: 32px; text-align: center;">
          <p style="margin: 0; color: #4b5563; font-size: 16px;">
            Visit <a href="${siteUrl}" style="color: ${styles.accent}; text-decoration: none; font-weight: 600;">PicoCareer</a> 
            to discover more opportunities tailored to your interests.
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

export function getEmailSubject(contentType: string, firstName: string = ''): string {
  const nameSection = firstName ? `${firstName}, ` : '';
  
  switch (contentType) {
    case 'scholarships':
      return `🎓 ${nameSection}Your Personalized Scholarship Opportunities!`;
    case 'opportunities':
      return `🚀 ${nameSection}Exclusive Career Opportunities Selected for You`;
    case 'careers':
      return `💼 ${nameSection}Discover Your Next Career Move`;
    case 'majors':
      return `📚 ${nameSection}Explore These Academic Paths`;
    case 'schools':
      return `🏛️ ${nameSection}Top Educational Institutions for You`;
    case 'mentors':
      return `👋 ${nameSection}Meet Your Potential Mentors`;
    case 'blogs':
      return `📖 ${nameSection}Fresh Insights Curated for You`;
    default:
      return `${nameSection}New Content Updates for You`;
  }
}
