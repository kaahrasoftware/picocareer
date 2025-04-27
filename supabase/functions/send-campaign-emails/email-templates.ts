import { ContentItem, EmailTemplateSettings } from "./types.ts";

function getDialogUrl(contentType: string, id: string, siteUrl: string): string {
  switch (contentType) {
    case 'blogs':
      return `${siteUrl}/blog?dialog=true&blogId=${id}`;
    case 'careers':
      return `${siteUrl}/career?dialog=true&careerId=${id}`;
    case 'majors':
      return `${siteUrl}/program?dialog=true&majorId=${id}`;
    case 'mentors':
      return `${siteUrl}/mentor?dialog=true&mentorId=${id}`;
    case 'scholarships':
      return `${siteUrl}/scholarships?dialog=true&scholarshipId=${id}`;
    case 'opportunities':
      return `${siteUrl}/opportunities?dialog=true&opportunityId=${id}`;
    default:
      throw new Error(`Unsupported content type: ${contentType}`);
  }
}

function generateContentCard(
  item: ContentItem,
  contentType: string,
  styles: { primary: string; secondary: string; accent: string },
  settings?: EmailTemplateSettings,
  siteUrl: string
): string {
  // Get the appropriate image URL, with fallbacks
  const imageUrl = item.cover_image_url || item.image_url || item.avatar_url || `${siteUrl}/placeholder_${contentType}.jpg`;
  const detailUrl = getDialogUrl(contentType, item.id, siteUrl);
  
  // Only show content blocks that are enabled in settings
  const layoutSettings = settings?.layout_settings || {
    headerStyle: 'centered',
    showAuthor: true,
    showDate: true,
    imagePosition: 'top',
    contentBlocks: ['title', 'image', 'description', 'metadata', 'cta'],
    metadataDisplay: ['category', 'date', 'author']
  };

  const showImage = layoutSettings.contentBlocks.includes('image');
  const showTitle = layoutSettings.contentBlocks.includes('title');
  const showDescription = layoutSettings.contentBlocks.includes('description');
  const showCta = layoutSettings.contentBlocks.includes('cta');
  
  // Generate metadata based on content type and settings
  let metadata = '';
  if (layoutSettings.contentBlocks.includes('metadata')) {
    switch(contentType) {
      case 'careers':
        if (layoutSettings.metadataDisplay.includes('salary') && item.salary_range) {
          metadata += `<p style="color: #4b5563; margin-bottom: 5px; font-size: 14px;">💰 ${item.salary_range}</p>`;
        }
        if (layoutSettings.metadataDisplay.includes('company') && item.company_name) {
          metadata += `<p style="color: #4b5563; margin-bottom: 5px; font-size: 14px;">🏢 ${item.company_name}</p>`;
        }
        if (layoutSettings.metadataDisplay.includes('location') && item.location) {
          metadata += `<p style="color: #4b5563; margin-bottom: 5px; font-size: 14px;">📍 ${item.location}</p>`;
        }
        break;
        
      case 'scholarships':
        if (layoutSettings.metadataDisplay.includes('amount') && item.amount) {
          metadata += `<p style="color: #4b5563; margin-bottom: 5px; font-size: 14px;">💰 $${item.amount}</p>`;
        }
        if (layoutSettings.metadataDisplay.includes('provider') && item.provider_name) {
          metadata += `<p style="color: #4b5563; margin-bottom: 5px; font-size: 14px;">🏢 ${item.provider_name}</p>`;
        }
        if (layoutSettings.metadataDisplay.includes('deadline') && item.deadline) {
          metadata += `<p style="color: #4b5563; margin-bottom: 5px; font-size: 14px;">⏰ Deadline: ${new Date(item.deadline).toLocaleDateString()}</p>`;
        }
        break;
        
      case 'opportunities':
        if (layoutSettings.metadataDisplay.includes('provider') && item.provider_name) {
          metadata += `<p style="color: #4b5563; margin-bottom: 5px; font-size: 14px;">🏢 ${item.provider_name}</p>`;
        }
        if (layoutSettings.metadataDisplay.includes('compensation') && item.compensation) {
          metadata += `<p style="color: #4b5563; margin-bottom: 5px; font-size: 14px;">💰 ${item.compensation}</p>`;
        }
        if (layoutSettings.metadataDisplay.includes('location') && item.location) {
          const locationText = item.remote ? `${item.location} (Remote available)` : item.location;
          metadata += `<p style="color: #4b5563; margin-bottom: 5px; font-size: 14px;">📍 ${locationText}</p>`;
        }
        break;
    }

    // Add author and date if enabled
    if (layoutSettings.showAuthor && layoutSettings.metadataDisplay.includes('author') && item.author_name) {
      metadata += `<p style="color: #4b5563; margin-bottom: 5px; font-size: 14px;">✍️ ${item.author_name}</p>`;
    }
    if (layoutSettings.showDate && layoutSettings.metadataDisplay.includes('date') && item.created_at) {
      metadata += `<p style="color: #4b5563; margin-bottom: 5px; font-size: 14px;">📅 ${new Date(item.created_at).toLocaleDateString()}</p>`;
    }
  }

  // Generate image HTML based on position setting
  const imageHtml = showImage && imageUrl ? `
    <img 
      src="${imageUrl}" 
      alt="${item.title || ''}"
      style="${getImageStyles(layoutSettings.imagePosition)}"
    />
  ` : '';

  // Build content card based on layout settings
  const contentHtml = `
    <div style="padding: 16px;">
      ${layoutSettings.imagePosition === 'top' ? imageHtml : ''}
      
      <div style="display: ${layoutSettings.imagePosition === 'side' ? 'flex' : 'block'}; gap: 16px;">
        ${layoutSettings.imagePosition === 'side' ? imageHtml : ''}
        
        <div style="flex: 1;">
          ${showTitle ? `
            <h3 style="margin-top: 0; margin-bottom: 8px; font-size: 18px; color: ${styles.accent};">
              ${item.title || ''}
            </h3>
          ` : ''}
          
          ${metadata}
          
          ${showDescription && item.description ? `
            <p style="color: #4b5563; margin: 8px 0; font-size: 14px; line-height: 1.5;">
              ${item.description.length > 150 ? item.description.substring(0, 147) + '...' : item.description}
            </p>
          ` : ''}
          
          ${layoutSettings.imagePosition === 'inline' ? imageHtml : ''}
          
          ${showCta ? `
            <div style="margin-top: 16px;">
              <a 
                href="${detailUrl}" 
                style="display: inline-block; background: linear-gradient(135deg, ${styles.primary}, ${styles.secondary}); 
                       color: white; padding: 8px 16px; text-decoration: none; border-radius: 6px; 
                       font-weight: 500;"
              >
                ${settings?.content?.cta_text || 'Learn More'}
              </a>
            </div>
          ` : ''}
        </div>
      </div>
    </div>
  `;

  return `
    <div style="margin-bottom: 24px; border: 1px solid #e5e7eb; border-radius: 12px; 
                overflow: hidden; background-color: white;">
      ${contentHtml}
    </div>
  `;
}

function getImageStyles(position: 'top' | 'inline' | 'side' = 'top'): string {
  const baseStyles = 'border-radius: 8px;';
  switch (position) {
    case 'side':
      return `${baseStyles} width: 200px; height: auto; margin: 0;`;
    case 'inline':
      return `${baseStyles} width: 60%; height: auto; margin: 12px auto; display: block;`;
    case 'top':
    default:
      return `${baseStyles} width: 100%; height: auto; margin-bottom: 12px; max-width: 600px;`;
  }
}

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

  // Get content type specific settings or fall back to global settings
  const settings = {
    primary_color: templateSettings.primary_color,
    secondary_color: templateSettings.secondary_color,
    accent_color: templateSettings.accent_color,
    logo_url: templateSettings.logo_url || defaultLogoUrl,
    layout_settings: {
      headerStyle: 'centered' as const,
      showAuthor: false,
      showDate: true,
      imagePosition: 'top' as const,
      contentBlocks: ['title', 'image', 'description', 'metadata', 'cta'],
      metadataDisplay: ['date', 'category']
    }
  };

  function generateHeader(
    title: string,
    headerStyle: 'centered' | 'banner' | 'minimal',
    styles: any,
    logoUrl?: string
  ) {
    switch (headerStyle) {
      case 'banner':
        return `
          <div style="background: linear-gradient(135deg, ${styles.primary_color}, ${styles.secondary_color}); color: white; padding: 32px; text-align: center; margin-bottom: 24px;">
            ${logoUrl ? `<img src="${logoUrl}" alt="Logo" style="height: 40px; margin-bottom: 16px;">` : ''}
            <h1 style="margin: 0; font-size: 28px; font-weight: 600;">${title}</h1>
          </div>
        `;
        
      case 'minimal':
        return `
          <div style="padding: 24px; margin-bottom: 24px;">
            ${logoUrl ? `<img src="${logoUrl}" alt="Logo" style="height: 32px; margin-bottom: 16px;">` : ''}
            <h1 style="margin: 0; font-size: 24px; font-weight: 600; color: ${styles.primary_color};">${title}</h1>
            <div style="width: 50px; height: 3px; background-color: ${styles.accent_color}; margin-top: 12px;"></div>
          </div>
        `;
        
      case 'centered':
      default:
        return `
          <div style="text-align: center; padding: 24px; margin-bottom: 24px;">
            ${logoUrl ? `<img src="${logoUrl}" alt="Logo" style="height: 40px; margin-bottom: 16px;">` : ''}
            <h1 style="margin: 0; font-size: 26px; font-weight: 600; color: ${styles.primary_color};">${title}</h1>
          </div>
        `;
    }
  }

  const header = generateHeader(
    title,
    settings.layout_settings.headerStyle,
    settings,
    settings.logo_url
  );

  const contentCardsHtml = contentItems.length > 0
    ? contentItems.map(item => generateContentCard(item, contentType, settings, templateSettings, siteUrl)).join('')
    : '<p style="text-align: center; padding: 20px; color: #6b7280;">No items to display.</p>';

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
        <div style="background: linear-gradient(135deg, ${settings.primary_color}, ${settings.secondary_color}); color: white; padding: 24px; border-radius: 12px; margin-bottom: 24px; text-align: center;">
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
            Visit <a href="${siteUrl}" style="color: ${settings.accent_color}; text-decoration: none; font-weight: bold;">PicoCareer</a> 
            to discover more opportunities tailored to your interests.
          </p>
        </div>
        
        <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb; text-align: center;">
          <p style="color: #6b7280; font-size: 12px;">&copy; ${new Date().getFullYear()} PicoCareer. All rights reserved.</p>
          <p style="color: #6b7280; font-size: 12px;">
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
