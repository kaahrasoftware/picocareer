
export type ContentItem = {
  id: string;
  title: string;
  description?: string;
  provider_name?: string;
  amount?: number | string;
  deadline?: string;
  compensation?: string;
  location?: string;
  image_url?: string;
  cover_image_url?: string;
  [key: string]: any;
};

export const getContentTypeStyles = (contentType: string) => {
  switch (contentType) {
    case 'scholarships':
      return {
        gradient: 'background: linear-gradient(135deg, #9333ea, #6b21a8)',
        accent: '#9333ea',
        icon: '🎓'
      };
    case 'opportunities':
      return {
        gradient: 'background: linear-gradient(135deg, #2563eb, #1d4ed8)',
        accent: '#2563eb',
        icon: '🚀'
      };
    case 'careers':
      return {
        gradient: 'background: linear-gradient(135deg, #0d9488, #0f766e)',
        accent: '#0d9488',
        icon: '💼'
      };
    case 'majors':
      return {
        gradient: 'background: linear-gradient(135deg, #4f46e5, #4338ca)',
        accent: '#4f46e5',
        icon: '📚'
      };
    case 'schools':
      return {
        gradient: 'background: linear-gradient(135deg, #0ea5e9, #0284c7)',
        accent: '#0ea5e9',
        icon: '🏛️'
      };
    case 'mentors':
      return {
        gradient: 'background: linear-gradient(135deg, #d97706, #b45309)',
        accent: '#d97706',
        icon: '👋'
      };
    case 'blogs':
      return {
        gradient: 'background: linear-gradient(135deg, #e11d48, #be123c)',
        accent: '#e11d48',
        icon: '📖'
      };
    default:
      return {
        gradient: 'background: linear-gradient(135deg, #6b7280, #4b5563)',
        accent: '#6b7280',
        icon: '📎'
      };
  }
};

export const getEmailSubject = (contentType: string, firstName: string = ''): string => {
  const nameSection = firstName ? `, ${firstName}` : '';
  
  switch (contentType) {
    case 'scholarships':
      return `🎓 Your Personalized Scholarship Opportunities Await${nameSection}!`;
    case 'opportunities':
      return `🚀 Exclusive Career Opportunities Selected for You${nameSection}`;
    case 'careers':
      return `💼 Discover Your Next Career Move${nameSection}`;
    case 'majors':
      return `📚 Explore These Academic Paths${nameSection}`;
    case 'schools':
      return `🏛️ Top Educational Institutions${nameSection}`;
    case 'mentors':
      return `👋 Meet Your Potential Mentors${nameSection}`;
    case 'blogs':
      return `📖 Fresh Insights Curated for You${nameSection}`;
    default:
      return `New Content Updates${nameSection}`;
  }
};

export const formatContentCard = (content: ContentItem, contentType: string, siteUrl: string): string => {
  if (!content) return '';
  
  const styles = getContentTypeStyles(contentType);
  const contentUrl = `${siteUrl}/${contentType}/${content.id}`;
  
  // Format content details based on type
  let detailsHtml = '';
  if (content.description) {
    detailsHtml += `
      <div style="color: #4b5563; margin-bottom: 16px; font-size: 15px; line-height: 1.5;">
        ${content.description}
      </div>
    `;
  }

  // Add type-specific metadata with improved styling
  let metadataHtml = '';
  switch (contentType) {
    case 'scholarships':
      if (content.provider_name) {
        metadataHtml += `
          <div style="margin-bottom: 8px; padding: 8px 12px; background-color: #f9fafb; border-radius: 6px;">
            <span style="font-weight: 600; color: #374151;">Provider:</span>
            <span style="color: #4b5563;"> ${content.provider_name}</span>
          </div>
        `;
      }
      if (content.amount) {
        metadataHtml += `
          <div style="margin-bottom: 8px; padding: 8px 12px; background-color: #f9fafb; border-radius: 6px;">
            <span style="font-weight: 600; color: #374151;">Amount:</span>
            <span style="color: #4b5563;"> $${typeof content.amount === 'number' ? content.amount.toLocaleString() : content.amount}</span>
          </div>
        `;
      }
      if (content.deadline) {
        const date = new Date(content.deadline);
        metadataHtml += `
          <div style="margin-bottom: 8px; padding: 8px 12px; background-color: #f9fafb; border-radius: 6px;">
            <span style="font-weight: 600; color: #374151;">Deadline:</span>
            <span style="color: #4b5563;"> ${date.toLocaleDateString('en-US', { 
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            })}</span>
          </div>
        `;
      }
      break;
      
    case 'opportunities':
      if (content.provider_name) {
        metadataHtml += `
          <div style="margin-bottom: 8px; padding: 8px 12px; background-color: #f9fafb; border-radius: 6px;">
            <span style="font-weight: 600; color: #374151;">Provider:</span>
            <span style="color: #4b5563;"> ${content.provider_name}</span>
          </div>
        `;
      }
      if (content.compensation) {
        metadataHtml += `
          <div style="margin-bottom: 8px; padding: 8px 12px; background-color: #f9fafb; border-radius: 6px;">
            <span style="font-weight: 600; color: #374151;">Compensation:</span>
            <span style="color: #4b5563;"> ${content.compensation}</span>
          </div>
        `;
      }
      if (content.location) {
        metadataHtml += `
          <div style="margin-bottom: 8px; padding: 8px 12px; background-color: #f9fafb; border-radius: 6px;">
            <span style="font-weight: 600; color: #374151;">Location:</span>
            <span style="color: #4b5563;"> ${content.location}</span>
          </div>
        `;
      }
      break;
  }

  return `
    <div style="margin-bottom: 32px; border: 1px solid #e5e7eb; border-radius: 12px; overflow: hidden; background-color: white;">
      <div style="padding: 24px;">
        ${content.cover_image_url ? `
          <img 
            src="${content.cover_image_url}" 
            alt="${content.title || 'Content'}"
            style="width: 100%; height: auto; border-radius: 8px; margin-bottom: 16px; max-width: 600px;"
          />
        ` : ''}
        <h2 style="margin-top: 0; margin-bottom: 16px; font-size: 24px; color: ${styles.accent}; font-weight: 600;">
          ${content.title}
        </h2>
        ${detailsHtml}
        ${metadataHtml}
        <div style="margin-top: 20px;">
          <a 
            href="${contentUrl}" 
            style="display: inline-block; ${styles.gradient}; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: 500; font-size: 16px;"
          >
            Learn More
          </a>
        </div>
      </div>
    </div>
  `;
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
    <body style="font-family: Arial, sans-serif; margin: 0; padding: 0; background-color: #f9fafb;">
      <div style="max-width: 600px; margin: 0 auto; padding: 24px;">
        <div style="${styles.gradient}; color: white; padding: 32px; border-radius: 16px; margin-bottom: 32px; text-align: center;">
          <div style="font-size: 48px; margin-bottom: 16px;">${styles.icon}</div>
          <h1 style="margin: 0; font-size: 32px; font-weight: 700;">${title}</h1>
        </div>
        
        <p style="margin-top: 0; margin-bottom: 24px; color: #374151; font-size: 18px; line-height: 1.5;">
          Hello ${recipientName},
        </p>
        
        <div style="margin-bottom: 32px; color: #374151; font-size: 16px; line-height: 1.5;">
          ${body}
        </div>
        
        <div style="margin: 32px 0;">
          ${contentCardsHtml}
        </div>
        
        <div style="background-color: #f3f4f6; padding: 24px; border-radius: 12px; margin-top: 40px; text-align: center;">
          <p style="margin-top: 0; margin-bottom: 0; color: #4b5563; font-size: 16px;">
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

export const CONTENT_TYPE_LABELS: Record<string, string> = {
  scholarships: "Scholarship Spotlight",
  opportunities: "Opportunity Spotlight",
  careers: "Career Spotlight",
  majors: "Major Spotlight",
  schools: "School Spotlight",
  mentors: "Mentor Spotlight",
  blogs: "Blog Spotlight",
};
