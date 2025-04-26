
import { ContentItem, EmailTemplateSettings } from "./types.ts";
import { getContentTypeStyles } from "./styles.ts";

export function generateEmailContent(
  title: string,
  body: string,
  recipientName: string = '',
  campaignId: string,
  contentItems: ContentItem[],
  contentType: string,
  siteUrl: string,
  templateSettings: EmailTemplateSettings
): string {
  const unsubscribeUrl = `${siteUrl}/unsubscribe?campaign=${campaignId}`;
  const defaultLogoUrl = `${siteUrl}/logo-default.png`;
  const currentYear = new Date().getFullYear();

  // Use template settings colors or fall back to content type defaults
  const defaultStyles = getContentTypeStyles(contentType);
  const styles = {
    primary: templateSettings.primary_color || defaultStyles.accent,
    secondary: templateSettings.secondary_color || defaultStyles.accent,
    accent: templateSettings.accent_color || defaultStyles.accent,
  };

  let contentCardsHtml = '';
  if (contentItems && contentItems.length > 0) {
    contentItems.forEach(item => {
      contentCardsHtml += generateContentCard(item, contentType, styles, siteUrl);
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
        <div style="background: linear-gradient(135deg, ${styles.primary}, ${styles.secondary}); color: white; padding: 24px; border-radius: 12px; margin-bottom: 24px; text-align: center;">
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

function generateContentCard(
  item: ContentItem,
  contentType: string,
  styles: { primary: string; secondary: string; accent: string },
  siteUrl: string
): string {
  const imageUrl = item.cover_image_url || item.image_url || `${siteUrl}/placeholder_${contentType}.jpg`;
  const title = item.title || '';
  const description = item.description ? (item.description.length > 150 ? item.description.substring(0, 147) + '...' : item.description) : '';
  const detailUrl = `${siteUrl}/${contentType}/${item.id}`;

  return `
    <div style="margin-bottom: 24px; border: 1px solid #e5e7eb; border-radius: 12px; overflow: hidden; background-color: white;">
      <div style="padding: 16px;">
        ${item.cover_image_url ? `
          <img 
            src="${item.cover_image_url}" 
            alt="${title}"
            style="width: 100%; height: auto; border-radius: 8px; margin-bottom: 12px; max-width: 600px;"
          />
        ` : ''}
        <h3 style="margin-top: 0; margin-bottom: 8px; font-size: 18px; color: ${styles.accent};">
          ${title}
        </h3>
        <p style="color: #4b5563; margin-bottom: 12px; font-size: 14px;">
          ${description}
        </p>
        <div style="margin-top: 16px;">
          <a 
            href="${detailUrl}" 
            style="display: inline-block; background: linear-gradient(135deg, ${styles.primary}, ${styles.secondary}); color: white; padding: 8px 16px; text-decoration: none; border-radius: 6px; font-weight: 500;"
          >
            Learn More
          </a>
        </div>
      </div>
    </div>
  `;
}

export function getEmailSubject(contentType: string, firstName: string = ''): string {
  const nameSection = firstName ? `${firstName}, ` : '';
  
  switch (contentType) {
    case 'scholarships':
      return `🎓 ${nameSection}Your Personalized Scholarship Opportunities!`;
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
