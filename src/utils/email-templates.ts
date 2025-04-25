
import { ContentItem } from "@/types/database/email";
import { formatContentCard } from "./email-templates/content-cards";
import { generateBaseTemplate } from "./email-templates/base-template";
import { generateContentHeader } from "./email-templates/content-header";
import { getContentTypeStyles } from "./email-templates/styles";

export function generateEmailContent(
  title: string,
  body: string,
  recipientName: string = '',
  campaignId: string,
  contentItems: ContentItem[],
  contentType: string,
  siteUrl: string
): string {
  // Calculate total amount for scholarships
  const totalAmount = contentType === 'scholarships' 
    ? calculateTotalAmount(contentItems)
    : undefined;

  // Generate content cards
  const contentCardsHtml = contentItems.length > 0
    ? contentItems.map(item => formatContentCard(item, contentType, siteUrl)).join('')
    : '<p style="text-align: center; padding: 20px; color: #6b7280;">No items to display at this time.</p>';

  // Generate main content
  const mainContent = `
    ${generateContentHeader(contentType, totalAmount, recipientName)}
    
    <div style="background-color: white; border-radius: 12px; padding: 32px; box-shadow: 0 2px 4px rgba(0,0,0,0.05);">
      ${contentCardsHtml}
    </div>
  `;

  // Generate complete email using base template
  const unsubscribeUrl = `${siteUrl}/unsubscribe?campaign=${campaignId}`;
  return generateBaseTemplate(mainContent, siteUrl, unsubscribeUrl);
}

function calculateTotalAmount(contentItems: ContentItem[]): string {
  const total = contentItems.reduce((sum, item) => {
    const amount = typeof item.amount === 'number' ? item.amount : 0;
    return sum + amount;
  }, 0);

  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(total);
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

// Export the imported function so it's available to importers of this file
export { getContentTypeStyles };
