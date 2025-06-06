import { ContentItem, EmailContentTypeSettings } from "@/types/database/email";
import { formatContentCard } from "./content-cards";
import { generateHeader } from "./header-templates";
import { generateContentHeader } from "./content-header";

export function generateEmailContent(
  title: string,
  body: string,
  recipientName: string = '',
  campaignId: string,
  contentItems: ContentItem[],
  contentType: string,
  siteUrl: string,
  settings?: EmailContentTypeSettings
): string {
  const styles = settings ? {
    primary: settings.primary_color,
    secondary: settings.secondary_color,
    accent: settings.accent_color
  } : {
    primary: "#4f46e5",
    secondary: "#3730a3",
    accent: "#4f46e5"
  };

  const layoutSettings = settings?.layout_settings || {
    headerStyle: 'centered',
    showAuthor: true,
    showDate: true,
    imagePosition: 'top',
    contentBlocks: ['title', 'image', 'description', 'metadata', 'cta'],
    metadataDisplay: ['category', 'date', 'author']
  };

  // Use the new content header generator that handles scholarships specially
  const header = generateContentHeader(
    contentType,
    undefined, // totalAmount - calculated inside for scholarships
    recipientName,
    styles,
    contentItems
  );

  // Ensure contentItems is an array before attempting to map over it
  const safeContentItems = Array.isArray(contentItems) ? contentItems : [];

  // Generate content cards with updated parameters
  const contentCardsHtml = safeContentItems.length > 0
    ? safeContentItems.map(item => formatContentCard(
        item, 
        contentType, 
        siteUrl,
        styles, 
        layoutSettings
      )).join('')
    : '<p style="text-align: center; padding: 20px; color: #6b7280;">No items to display.</p>';

  const introText = settings?.content?.intro_text || body;
  const ctaText = settings?.content?.cta_text || 'Check out more content on our website';
  const footerText = settings?.content?.footer_text || `© ${new Date().getFullYear()} All rights reserved.`;

  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${title}</title>
      </head>
      <body style="margin: 0; padding: 20px; background-color: #f9fafb; 
                   font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
        <div style="max-width: 600px; margin: 0 auto; background: white; border-radius: 8px; 
                    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1); overflow: hidden;">
          ${header}
          
          <div style="padding: 0 24px;">
            <p style="color: #374151; font-size: 16px; line-height: 1.5;">
              ${introText}
            </p>
          </div>

          <div style="padding: 24px;">
            ${contentCardsHtml}
          </div>

          <div style="background-color: #f9fafb; padding: 24px; text-align: center; border-top: 1px solid #e5e7eb;">
            <p style="margin: 0 0 16px 0; color: #4b5563;">
              ${ctaText}
            </p>
            <a 
              href="${siteUrl}" 
              style="display: inline-block; background-color: ${styles.accent}; color: white; 
                     padding: 12px 24px; text-decoration: none; border-radius: 6px; 
                     font-weight: 500;"
            >
              Visit Website
            </a>
          </div>

          <div style="padding: 24px; text-align: center; color: #6b7280; font-size: 14px;">
            <p style="margin: 0 0 8px 0;">${footerText}</p>
            <a 
              href="${siteUrl}/unsubscribe?campaign=${campaignId}" 
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
    case 'events':
      return `🗓️ Upcoming Events Selected For You, ${nameSection}`;
    default:
      return `New Content Updates for You, ${nameSection}`;
  }
}

// Export the imported functions
export { getContentTypeStyles } from "./styles";
