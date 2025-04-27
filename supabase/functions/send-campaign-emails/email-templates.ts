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
  const imageUrl = item.cover_image_url || item.image_url || item.avatar_url || `${siteUrl}/placeholder_${contentType}.jpg`;
  const detailUrl = getDialogUrl(contentType, item.id, siteUrl);
  
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

  const metadata = generateMetadata(item, contentType, layoutSettings.metadataDisplay);

  const imageHtml = showImage && imageUrl ? `
    <img 
      src="${imageUrl}" 
      alt="${item.title || ''}"
      style="${getImageStyles(layoutSettings.imagePosition)}"
    />
  ` : '';

  const contentHtml = `
    <div style="padding: 16px;">
      ${layoutSettings.imagePosition === 'top' ? imageHtml : ''}
      
      <div style="display: ${layoutSettings.imagePosition === 'side' ? 'flex' : 'block'}; gap: 16px;">
        ${layoutSettings.imagePosition === 'side' ? imageHtml : ''}
        
        <div style="flex: 1;">
          ${showTitle ? `
            <h3 style="margin-top: 0; margin-bottom: 8px; font-size: 18px; color: ${styles.accent}; 
                       font-weight: 600; line-height: 1.4;">
              ${item.title || ''}
            </h3>
          ` : ''}
          
          ${metadata}
          
          ${showDescription && item.description ? `
            <p style="color: #4b5563; margin: 8px 0; font-size: 14px; line-height: 1.6;">
              ${item.description.length > 150 ? item.description.substring(0, 147) + '...' : item.description}
            </p>
          ` : ''}
          
          ${layoutSettings.imagePosition === 'inline' ? imageHtml : ''}
          
          ${showCta ? `
            <div style="margin-top: 16px;">
              <a 
                href="${detailUrl}" 
                style="display: inline-block; 
                       background: linear-gradient(135deg, ${styles.primary}, ${styles.secondary}); 
                       color: white; padding: 12px 24px; text-decoration: none; 
                       border-radius: 6px; font-weight: 500; font-size: 14px;
                       transition: opacity 0.2s ease;"
                onmouseover="this.style.opacity='0.9'"
                onmouseout="this.style.opacity='1'"
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
                overflow: hidden; background-color: white; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
      ${contentHtml}
    </div>
  `;
}

function getImageStyles(position: 'top' | 'inline' | 'side' = 'top'): string {
  const baseStyles = 'border-radius: 8px; object-fit: cover;';
  switch (position) {
    case 'side':
      return `${baseStyles} width: 200px; height: 140px; margin: 0;`;
    case 'inline':
      return `${baseStyles} width: 60%; height: auto; margin: 12px auto; display: block;`;
    case 'top':
    default:
      return `${baseStyles} width: 100%; height: auto; margin-bottom: 12px; max-height: 300px;`;
  }
}

function generateMetadata(item: ContentItem, contentType: string, metadataDisplay: string[] = []): string {
  const metadataItems: string[] = [];

  switch(contentType) {
    case 'scholarships':
      if (metadataDisplay.includes('amount') && item.amount) {
        metadataItems.push(`<span style="display: inline-flex; align-items: center; gap: 4px;">
          💰 $${item.amount.toLocaleString()}
        </span>`);
      }
      if (metadataDisplay.includes('provider') && item.provider_name) {
        metadataItems.push(`<span style="display: inline-flex; align-items: center; gap: 4px;">
          🏢 ${item.provider_name}
        </span>`);
      }
      if (metadataDisplay.includes('deadline') && item.deadline) {
        metadataItems.push(`<span style="display: inline-flex; align-items: center; gap: 4px;">
          ⏰ Deadline: ${new Date(item.deadline).toLocaleDateString()}
        </span>`);
      }
      break;
      
    case 'opportunities':
      if (metadataDisplay.includes('provider') && item.provider_name) {
        metadataItems.push(`<span style="display: inline-flex; align-items: center; gap: 4px;">
          🏢 ${item.provider_name}
        </span>`);
      }
      if (metadataDisplay.includes('compensation') && item.compensation) {
        metadataItems.push(`<span style="display: inline-flex; align-items: center; gap: 4px;">
          💰 ${item.compensation}
        </span>`);
      }
      if (metadataDisplay.includes('location') && item.location) {
        const locationText = item.remote ? `${item.location} (Remote available)` : item.location;
        metadataItems.push(`<span style="display: inline-flex; align-items: center; gap: 4px;">
          📍 ${locationText}
        </span>`);
      }
      break;
  }

  if (metadataDisplay.includes('author') && item.author_name) {
    metadataItems.push(`<span style="display: inline-flex; align-items: center; gap: 4px;">
      ✍️ ${item.author_name}
    </span>`);
  }
  
  if (metadataDisplay.includes('date') && item.created_at) {
    metadataItems.push(`<span style="display: inline-flex; align-items: center; gap: 4px;">
      📅 ${new Date(item.created_at).toLocaleDateString()}
    </span>`);
  }

  return metadataItems.length ? `
    <div style="color: #6b7280; font-size: 14px; margin: 8px 0; display: flex; flex-wrap: wrap; gap: 12px;">
      ${metadataItems.join('')}
    </div>
  ` : '';
}

export function generateEmailContent(
  title: string,
  body: string,
  recipientName: string = '',
  campaignId: string,
  contentItems: ContentItem[],
  contentType: string,
  siteUrl: string,
  templateSettings?: EmailTemplateSettings
): string {
  const unsubscribeUrl = `${siteUrl}/unsubscribe?campaign=${campaignId}`;
  const defaultLogoUrl = `${siteUrl}/logo-default.png`;

  const settings = {
    primary_color: templateSettings?.primary_color || '#007bff',
    secondary_color: templateSettings?.secondary_color || '#0056b3',
    accent_color: templateSettings?.accent_color || '#28a745',
    logo_url: templateSettings?.logo_url || defaultLogoUrl,
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
