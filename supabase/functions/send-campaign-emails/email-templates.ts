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
      <p style="color: #4b5563; margin-bottom: 12px; font-size: 14px;">
        ${content.description.slice(0, 150)}${content.description.length > 150 ? '...' : ''}
      </p>
    `;
  }

  // Add type-specific metadata
  switch (contentType) {
    case 'scholarships':
      if (content.provider_name) {
        detailsHtml += `<p style="font-size: 14px; color: #6b7280; margin-bottom: 4px;">Provider: ${content.provider_name}</p>`;
      }
      if (content.amount) {
        detailsHtml += `<p style="font-size: 14px; color: #6b7280; margin-bottom: 4px;">Amount: ${content.amount}</p>`;
      }
      if (content.deadline) {
        detailsHtml += `<p style="font-size: 14px; color: #6b7280;">Deadline: ${new Date(content.deadline).toLocaleDateString()}</p>`;
      }
      break;
      
    case 'opportunities':
      if (content.provider_name) {
        detailsHtml += `<p style="font-size: 14px; color: #6b7280; margin-bottom: 4px;">Provider: ${content.provider_name}</p>`;
      }
      if (content.compensation) {
        detailsHtml += `<p style="font-size: 14px; color: #6b7280; margin-bottom: 4px;">Compensation: ${content.compensation}</p>`;
      }
      if (content.location) {
        detailsHtml += `<p style="font-size: 14px; color: #6b7280;">Location: ${content.location}</p>`;
      }
      break;
  }

  return `
    <div style="margin-bottom: 24px; border: 1px solid #e5e7eb; border-radius: 12px; overflow: hidden; background-color: white;">
      <div style="padding: 16px;">
        ${content.cover_image_url ? `
          <img 
            src="${content.cover_image_url}" 
            alt="${content.title || 'Content'}"
            style="width: 100%; height: auto; border-radius: 8px; margin-bottom: 12px; max-width: 600px;"
          />
        ` : ''}
        <h3 style="margin-top: 0; margin-bottom: 8px; font-size: 18px; color: ${styles.accent};">
          ${content.title}
        </h3>
        ${detailsHtml}
        <div style="margin-top: 16px;">
          <a 
            href="${contentUrl}" 
            style="display: inline-block; ${styles.gradient}; color: white; padding: 8px 16px; text-decoration: none; border-radius: 6px; font-weight: 500;"
          >
            Learn More
          </a>
        </div>
      </div>
    </div>
  `;
};

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
