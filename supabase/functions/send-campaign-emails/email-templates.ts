import { ContentItem, EmailTemplateSettings } from "./types.ts";
import { replaceTemplateVariables } from "./template-renderer.ts";

// Array of content types with display labels
export const CONTENT_TYPE_LABELS: Record<string, string> = {
  scholarships: "Scholarship Spotlight",
  opportunities: "Opportunity Spotlight",
  careers: "Career Spotlight",
  majors: "Major Spotlight",
  schools: "School Spotlight",
  mentors: "Mentor Spotlight",
  blogs: "Blog Spotlight",
  events: "Event Spotlight",
};

/**
 * Generates complete email content with proper template variable replacement
 */
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
  // Get colors based on template settings or defaults
  const colors = {
    primary: templateSettings.primary_color || "#4f46e5",
    secondary: templateSettings.secondary_color || "#3730a3",
    accent: templateSettings.accent_color || "#4f46e5"
  };

  // Default layout settings if none provided in template
  const layoutSettings = templateSettings.layout_settings || {
    headerStyle: 'centered',
    showAuthor: true,
    showDate: true,
    imagePosition: 'top',
    contentBlocks: ['title', 'image', 'description', 'metadata', 'cta'],
    metadataDisplay: ['category', 'date', 'author']
  };

  // Generate engaging intro text
  let introText = templateSettings.content?.intro_text || body;
  
  if (contentType === 'scholarships') {
    const totalAmount = contentItems.reduce((sum, item) => sum + (item.amount || 0), 0);
    const formattedTotal = new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(totalAmount);
    
    introText = `Here are some scholarships that our PicoCareer team thinks you might be interested in! We've found ${contentItems.length} scholarship${contentItems.length > 1 ? 's' : ''} worth <strong style="color: ${colors.accent};">${formattedTotal}</strong> highlighted for this week. Check them out and take the next step toward your educational goals!`;
  } else if (contentType === 'opportunities') {
    introText = `Here are some of the highlighted opportunities of the week we think you might be interested in! We've curated ${contentItems.length} exciting opportunit${contentItems.length > 1 ? 'ies' : 'y'} that could be perfect for your career journey. Check them out and take the next step toward your professional goals!`;
  }

  // Format content cards based on template settings
  const contentCardsHtml = contentItems.length > 0
    ? contentItems.map(item => formatContentCard(
        item, 
        contentType, 
        siteUrl,
        colors,
        layoutSettings
      )).join('')
    : '<p style="text-align: center; padding: 20px; color: #6b7280;">No items to display.</p>';

  // Generate the complete email HTML with proper template variable replacement
  const emailHtml = `
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
          ${generateHeader(
            templateSettings.content?.header_text || title,
            layoutSettings.headerStyle,
            colors,
            templateSettings.logo_url
          )}
          
          <div style="padding: 0 24px;">
            <p style="color: #374151; font-size: 16px; line-height: 1.5;">
              ${recipientName ? `Hello ${recipientName},` : 'Hello,'}
            </p>
            
            <p style="color: #374151; font-size: 16px; line-height: 1.5;">
              ${introText}
            </p>
          </div>

          <div style="padding: 24px;">
            ${contentCardsHtml}
          </div>

          <div style="background-color: #f9fafb; padding: 24px; text-align: center; border-top: 1px solid #e5e7eb;">
            <p style="margin: 0 0 16px 0; color: #4b5563;">
              ${templateSettings.content?.cta_text || "Visit our website to discover more opportunities"}
            </p>
            <a 
              href="${siteUrl}" 
              style="display: inline-block; background-color: ${colors.accent}; color: white; 
                     padding: 12px 24px; text-decoration: none; border-radius: 6px; 
                     font-weight: 500;"
            >
              Visit PicoCareer
            </a>
          </div>

          <div style="padding: 24px; text-align: center; color: #6b7280; font-size: 14px;">
            <p style="margin: 0 0 8px 0;">
              ${templateSettings.content?.footer_text || `© ${new Date().getFullYear()} PicoCareer. All rights reserved.`}
            </p>
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

  return emailHtml;
}

/**
 * Generates the email header with specified style
 */
function generateHeader(
  title: string,
  headerStyle: string = 'centered',
  colors: { primary: string; secondary: string; accent: string },
  logoUrl?: string
): string {
  switch (headerStyle) {
    case 'banner':
      return `
        <div style="background: linear-gradient(135deg, ${colors.primary}, ${colors.secondary}); color: white; padding: 32px; text-align: center; margin-bottom: 24px;">
          ${logoUrl ? `<img src="${logoUrl}" alt="Logo" style="height: 40px; margin-bottom: 16px;">` : ''}
          <h1 style="margin: 0; font-size: 28px; font-weight: 600;">${title}</h1>
        </div>
      `;
      
    case 'minimal':
      return `
        <div style="padding: 24px; margin-bottom: 24px;">
          ${logoUrl ? `<img src="${logoUrl}" alt="Logo" style="height: 32px; margin-bottom: 16px;">` : ''}
          <h1 style="margin: 0; font-size: 24px; font-weight: 600; color: ${colors.primary};">${title}</h1>
          <div style="width: 50px; height: 3px; background-color: ${colors.accent}; margin-top: 12px;"></div>
        </div>
      `;
      
    case 'centered':
    default:
      return `
        <div style="text-align: center; padding: 24px; margin-bottom: 24px;">
          ${logoUrl ? `<img src="${logoUrl}" alt="Logo" style="height: 40px; margin-bottom: 16px;">` : ''}
          <h1 style="margin: 0; font-size: 26px; font-weight: 600; color: ${colors.primary};">${title}</h1>
        </div>
      `;
  }
}

/**
 * Formats a content item into an HTML card for email templates
 */
function formatContentCard(
  item: ContentItem,
  contentType: string,
  siteUrl: string,
  colors: { primary: string; secondary: string; accent: string },
  layoutSettings?: {
    headerStyle?: string;
    showAuthor?: boolean;
    showDate?: boolean;
    imagePosition?: string;
    contentBlocks?: string[];
    metadataDisplay?: string[];
  }
): string {
  // Default layout settings if none provided
  const settings = layoutSettings || {
    headerStyle: 'centered',
    showAuthor: true,
    showDate: true,
    imagePosition: 'top',
    contentBlocks: ['title', 'image', 'description', 'metadata', 'cta'],
    metadataDisplay: ['category', 'date', 'author']
  };

  // Get display properties based on content type
  const title = item.title || `Untitled ${contentType}`;
  const description = item.description || '';
  const imageUrl = item.cover_image_url || item.image_url || item.avatar_url || '';

  // SPECIAL HANDLING FOR SCHOLARSHIPS - Keep existing scholarship structure
  if (contentType === 'scholarships') {
    // ... keep existing code (scholarship template)
    const amount = item.amount || 0;
    const formattedAmount = new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);

    const scholarshipUrl = `${siteUrl}/scholarships?dialog=${item.id}`;
    const deadline = item.deadline;
    const formattedDeadline = deadline 
      ? new Date(deadline).toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
          year: 'numeric'
        })
      : null;

    // Clean description - remove HTML tags and limit length
    const cleanDescription = description
      .replace(/<[^>]*>/g, '')
      .substring(0, 200);

    return `
      <div style="
        background: white;
        border-radius: 12px;
        padding: 24px;
        margin-bottom: 24px;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
        border-left: 4px solid ${colors.accent};
      ">
        <!-- 1. TITLE FIRST - Clear and prominent -->
        <h2 style="
          margin: 0 0 16px 0;
          font-size: 22px;
          font-weight: 700;
          color: ${colors.primary};
          line-height: 1.3;
        ">
          ${title}
        </h2>

        <!-- 2. DESCRIPTION SECOND - Engaging content -->
        ${cleanDescription ? `
          <p style="
            margin: 0 0 20px 0;
            font-size: 16px;
            color: #4b5563;
            line-height: 1.6;
          ">
            ${cleanDescription}${description.length > 200 ? '...' : ''}
          </p>
        ` : ''}

        <!-- 3. AMOUNT THIRD - Prominently displayed -->
        <div style="
          background: linear-gradient(135deg, ${colors.accent}, ${colors.primary});
          color: white;
          padding: 16px 20px;
          border-radius: 8px;
          text-align: center;
          margin: 20px 0;
        ">
          <div style="font-size: 14px; font-weight: 500; opacity: 0.9; margin-bottom: 4px;">
            Scholarship Amount
          </div>
          <div style="font-size: 32px; font-weight: 800;">
            ${formattedAmount}
          </div>
        </div>

        <!-- Additional Info -->
        <div style="margin: 16px 0;">
          ${item.provider_name ? `
            <p style="margin: 0 0 8px 0; font-size: 14px; color: #6b7280;">
              <strong>Provider:</strong> ${item.provider_name}
            </p>
          ` : ''}
          ${formattedDeadline ? `
            <p style="margin: 0; font-size: 14px; color: #dc2626; font-weight: 600;">
              <strong>⏰ Deadline:</strong> ${formattedDeadline}
            </p>
          ` : ''}
        </div>

        <!-- 4. CTA FOURTH - Clear call to action -->
        <div style="text-align: center; margin-top: 24px;">
          <a 
            href="${scholarshipUrl}" 
            style="
              display: inline-block;
              background: linear-gradient(135deg, ${colors.primary}, ${colors.secondary});
              color: white;
              padding: 14px 32px;
              text-decoration: none;
              border-radius: 8px;
              font-weight: 700;
              font-size: 16px;
              box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
              text-transform: uppercase;
              letter-spacing: 0.5px;
            "
          >
            🎓 Apply Now
          </a>
        </div>
      </div>
    `;
  }

  // SPECIAL HANDLING FOR OPPORTUNITIES - New Enhanced Design
  if (contentType === 'opportunities') {
    const opportunityUrl = `${siteUrl}/opportunities?dialog=${item.id}`;
    const deadline = item.deadline;
    const formattedDeadline = deadline 
      ? new Date(deadline).toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
          year: 'numeric'
        })
      : null;

    // Clean description - remove HTML tags and limit length
    const cleanDescription = description
      .replace(/<[^>]*>/g, '')
      .substring(0, 180);

    return `
      <div style="
        background: white;
        border-radius: 12px;
        padding: 24px;
        margin-bottom: 24px;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
        border-left: 4px solid ${colors.accent};
        position: relative;
      ">
        <!-- Header with Title -->
        <h2 style="
          margin: 0 0 16px 0;
          font-size: 22px;
          font-weight: 700;
          color: ${colors.primary};
          line-height: 1.3;
        ">
          ${title}
        </h2>

        <!-- Description -->
        ${cleanDescription ? `
          <p style="
            margin: 0 0 20px 0;
            font-size: 16px;
            color: #4b5563;
            line-height: 1.6;
          ">
            ${cleanDescription}${description.length > 180 ? '...' : ''}
          </p>
        ` : ''}

        <!-- Key Details Card -->
        <div style="
          background: linear-gradient(135deg, #f8fafc, #e2e8f0);
          border-radius: 8px;
          padding: 16px;
          margin: 20px 0;
          border-left: 3px solid ${colors.accent};
        ">
          <div style="display: grid; gap: 8px;">
            ${item.provider_name ? `
              <div style="display: flex; align-items: center; gap: 8px;">
                <span style="font-weight: 600; color: ${colors.primary}; font-size: 14px;">🏢 Provider:</span>
                <span style="color: #374151; font-size: 14px;">${item.provider_name}</span>
              </div>
            ` : ''}
            ${item.location ? `
              <div style="display: flex; align-items: center; gap: 8px;">
                <span style="font-weight: 600; color: ${colors.primary}; font-size: 14px;">📍 Location:</span>
                <span style="color: #374151; font-size: 14px;">${item.location}${item.remote ? ' (Remote Available)' : ''}</span>
              </div>
            ` : ''}
            ${item.compensation ? `
              <div style="display: flex; align-items: center; gap: 8px;">
                <span style="font-weight: 600; color: ${colors.primary}; font-size: 14px;">💰 Compensation:</span>
                <span style="color: #374151; font-size: 14px;">${item.compensation}</span>
              </div>
            ` : ''}
            ${formattedDeadline ? `
              <div style="display: flex; align-items: center; gap: 8px;">
                <span style="font-weight: 600; color: #dc2626; font-size: 14px;">⏰ Deadline:</span>
                <span style="color: #dc2626; font-size: 14px; font-weight: 600;">${formattedDeadline}</span>
              </div>
            ` : ''}
          </div>
        </div>

        <!-- CTA Button -->
        <div style="text-align: center; margin-top: 24px;">
          <a 
            href="${opportunityUrl}" 
            style="
              display: inline-block;
              background: linear-gradient(135deg, ${colors.primary}, ${colors.secondary});
              color: white;
              padding: 14px 32px;
              text-decoration: none;
              border-radius: 8px;
              font-weight: 700;
              font-size: 16px;
              box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
              text-transform: uppercase;
              letter-spacing: 0.5px;
              transition: all 0.3s ease;
            "
          >
            🚀 Apply Now
          </a>
        </div>
      </div>
    `;
  }

  // DEFAULT HANDLING FOR OTHER CONTENT TYPES - Keep existing code
  const formattedDate = item.created_at 
    ? new Date(item.created_at).toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric' 
      })
    : item.deadline 
      ? new Date(item.deadline).toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'short',
          day: 'numeric'
        })
      : '';

  const author = item.author_name || '';
  const category = contentType;

  // Determine the content link
  let contentLink = `${siteUrl}`;
  switch (contentType) {
    case 'blogs':
      contentLink += `/blog/${item.id}`;
      break;
    case 'careers':
      contentLink += `/career/${item.id}`;
      break;
    case 'majors':
      contentLink += `/program/${item.id}`;
      break;
    case 'opportunities':
      contentLink += `/opportunity/${item.id}`;
      break;
    case 'mentors':
      contentLink += `/profile/${item.id}`;
      break;
    case 'events':
      contentLink += `/event/${item.id}`;
      break;
    case 'schools':
      contentLink += `/school/${item.id}`;
      break;
    default:
      contentLink += `/${contentType}/${item.id}`;
  }

  // Add content-type specific metadata
  let metadataHtml = '';
  
  if (settings.contentBlocks?.includes('metadata')) {
    const metadataItems = [];
    
    if (settings.metadataDisplay?.includes('category')) {
      metadataItems.push(`<span style="color: ${colors.accent}; font-weight: 500;">${CONTENT_TYPE_LABELS[category] || category}</span>`);
    }
    
    if (settings.metadataDisplay?.includes('date') && formattedDate) {
      metadataItems.push(`<span>${item.deadline ? 'Deadline: ' : ''}${formattedDate}</span>`);
    }
    
    if (settings.metadataDisplay?.includes('author') && author) {
      metadataItems.push(`<span>By ${author}</span>`);
    }
    
    // Add custom metadata based on content type
    switch (contentType) {
      case 'opportunities':
        if (item.provider_name && settings.metadataDisplay?.includes('provider')) {
          metadataItems.push(`<span>Provider: ${item.provider_name}</span>`);
        }
        if (item.location && settings.metadataDisplay?.includes('location')) {
          metadataItems.push(`<span>Location: ${item.location}${item.remote ? ' (Remote available)' : ''}</span>`);
        }
        break;
      case 'careers':
        if (item.company_name && settings.metadataDisplay?.includes('company')) {
          metadataItems.push(`<span>Company: ${item.company_name}</span>`);
        }
        if (item.salary_range && settings.metadataDisplay?.includes('salary')) {
          metadataItems.push(`<span>Salary: ${item.salary_range}</span>`);
        }
        break;
    }
    
    if (metadataItems.length > 0) {
      metadataHtml = `
        <div style="display: flex; flex-wrap: wrap; gap: 12px; margin-bottom: 12px; font-size: 12px; color: #6b7280;">
          ${metadataItems.join('')}
        </div>
      `;
    }
  }

  // Build and return the HTML for the content card
  return `
    <div style="margin-bottom: 32px; background-color: white; border-radius: 8px; overflow: hidden; box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1); position: relative;">
      
      ${settings.contentBlocks?.includes('image') && imageUrl && settings.imagePosition === 'top' ? `
        <div style="width: 100%; height: 200px; overflow: hidden; background-color: #f3f4f6;">
          <img 
            src="${imageUrl}" 
            alt="${title}" 
            style="width: 100%; height: 100%; object-fit: cover;"
          />
        </div>
      ` : ''}
      
      <div style="padding: 20px;">
        ${settings.contentBlocks?.includes('title') ? `
          <h2 style="margin-top: 0; margin-bottom: 8px; color: #1f2937; font-size: 18px; font-weight: 600;">
            <a href="${contentLink}" style="color: ${colors.primary}; text-decoration: none;">
              ${title}
            </a>
          </h2>
        ` : ''}
        
        ${metadataHtml}
        
        ${settings.contentBlocks?.includes('image') && imageUrl && settings.imagePosition === 'inline' ? `
          <div style="width: 100%; height: 200px; overflow: hidden; margin: 16px 0; background-color: #f3f4f6;">
            <img 
              src="${imageUrl}" 
              alt="${title}" 
              style="width: 100%; height: 100%; object-fit: cover;"
            />
          </div>
        ` : ''}
        
        ${settings.contentBlocks?.includes('description') && description ? `
          <p style="margin-top: 0; margin-bottom: 16px; color: #4b5563; font-size: 14px; line-height: 1.5;">
            ${description.length > 150 ? description.substring(0, 150) + '...' : description}
          </p>
        ` : ''}
        
        ${settings.contentBlocks?.includes('cta') ? `
          <a 
            href="${contentLink}" 
            style="display: inline-block; padding: 8px 16px; background-color: ${colors.accent}; color: white; 
                  text-decoration: none; border-radius: 4px; font-size: 14px; font-weight: 500;"
          >
            Read More
          </a>
        ` : ''}
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
    case 'events':
      return `🗓️ Upcoming Events Selected For You, ${nameSection}`;
    default:
      return `New Content Updates for You, ${nameSection}`;
  }
}
