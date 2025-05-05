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
    case 'events':
      return `${siteUrl}/event?dialog=true&eventId=${id}`;
    default:
      return `${siteUrl}/${contentType}/${id}`;
  }
}

function generateContentCard(
  item: ContentItem,
  contentType: string,
  styles: { primary: string; secondary: string; accent: string },
  siteUrl: string,
  htmlTemplate?: string
): string {
  // Get the appropriate image URL, with fallbacks
  const imageUrl = item.cover_image_url || item.image_url || item.avatar_url || `${siteUrl}/placeholder_${contentType}.jpg`;
  const title = item.title || '';
  const description = item.description ? (item.description.length > 150 ? item.description.substring(0, 147) + '...' : item.description) : '';
  const detailUrl = getDialogUrl(contentType, item.id, siteUrl);

  // Prepare metadata based on content type
  const metadata: string[] = [];
  
  switch(contentType) {
    case 'careers':
      if (item.salary_range) metadata.push(`💰 ${item.salary_range}`);
      if (item.company_name) metadata.push(`🏢 ${item.company_name}`);
      if (item.location) metadata.push(`📍 ${item.location}`);
      break;
      
    case 'scholarships':
      if (item.amount) metadata.push(`💰 $${item.amount}`);
      if (item.provider_name) metadata.push(`🏢 ${item.provider_name}`);
      if (item.deadline) metadata.push(`⏰ Deadline: ${new Date(item.deadline).toLocaleDateString()}`);
      break;
      
    case 'opportunities':
      if (item.provider_name) metadata.push(`🏢 ${item.provider_name}`);
      if (item.compensation) metadata.push(`💰 ${item.compensation}`);
      if (item.location) {
        const locationText = item.remote ? `${item.location} (Remote available)` : item.location;
        metadata.push(`📍 ${locationText}`);
      }
      break;
    
    case 'events':
      if (item.start_time) metadata.push(`🗓️ ${new Date(item.start_time).toLocaleDateString()}`);
      if (item.platform) metadata.push(`💻 ${item.platform}`);
      break;
  }

  // If we have a custom HTML template, use it
  if (htmlTemplate) {
    let html = htmlTemplate;
    
    // Replace variables in the template
    html = html.replace(/{{title}}/g, title);
    html = html.replace(/{{description}}/g, description);
    html = html.replace(/{{image_url}}/g, imageUrl);
    html = html.replace(/{{detail_url}}/g, detailUrl);
    html = html.replace(/{{primary_color}}/g, styles.primary);
    html = html.replace(/{{secondary_color}}/g, styles.secondary);
    html = html.replace(/{{accent_color}}/g, styles.accent);
    
    // Handle metadata array
    if (metadata.length > 0) {
      // Replace the metadata conditional block
      html = html.replace(/{{#if metadata}}([^]*){{\/if}}/g, (match, content) => {
        return content;
      });
      
      // Create metadata HTML
      const metadataHtml = metadata.map(item => 
        `<p style="color: #4b5563; margin-bottom: 5px; font-size: 14px;">${item}</p>`
      ).join('');
      
      // Replace the metadata each loop with actual content
      html = html.replace(/{{#each metadata}}([^]*){{\/each}}/g, (match, content) => {
        return metadataHtml;
      });
    } else {
      // Remove the metadata conditional block if no metadata
      html = html.replace(/{{#if metadata}}([^]*){{\/if}}/g, '');
    }
    
    return html;
  }

  // Otherwise, use the default template
  return `
    <div style="margin-bottom: 24px; border: 1px solid #e5e7eb; border-radius: 12px; overflow: hidden; background-color: white;">
      <div style="padding: 16px;">
        ${imageUrl ? `
          <img 
            src="${imageUrl}" 
            alt="${title}"
            style="width: 100%; height: auto; border-radius: 8px; margin-bottom: 12px; max-width: 600px;"
          />
        ` : ''}
        <h3 style="margin-top: 0; margin-bottom: 8px; font-size: 18px; color: ${styles.accent};">
          ${title}
        </h3>
        ${metadata.map(meta => `<p style="color: #4b5563; margin-bottom: 5px; font-size: 14px;">${meta}</p>`).join('')}
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

async function getCustomTemplate(supabase: any, adminId: string, contentType: string, templateType: string): Promise<string | null> {
  try {
    const { data, error } = await supabase
      .from('email_html_templates')
      .select('html_content')
      .eq('admin_id', adminId)
      .eq('content_type', contentType)
      .eq('template_type', templateType)
      .single();

    if (error || !data) {
      return null;
    }

    return data.html_content;
  } catch (error) {
    console.error(`Error fetching ${templateType} template:`, error);
    return null;
  }
}

export async function generateEmailContent(
  title: string,
  body: string,
  recipientName: string = '',
  campaignId: string,
  contentItems: ContentItem[],
  contentType: string,
  siteUrl: string,
  templateSettings: EmailTemplateSettings,
  supabase: any
): Promise<string> {
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

  // Try to get custom templates from the database
  const customBaseTemplate = await getCustomTemplate(supabase, templateSettings.admin_id, contentType, 'base');
  const customHeaderTemplate = await getCustomTemplate(supabase, templateSettings.admin_id, contentType, 'header');
  const customContentCardTemplate = await getCustomTemplate(supabase, templateSettings.admin_id, contentType, 'content_card');
  const customFooterTemplate = await getCustomTemplate(supabase, templateSettings.admin_id, contentType, 'footer');

  // Generate content cards HTML
  const contentCardsHtml = contentItems.length > 0
    ? contentItems.map(item => generateContentCard(
        item, 
        contentType, 
        settings, 
        siteUrl,
        customContentCardTemplate
      )).join('')
    : '<p style="text-align: center; padding: 20px; color: #6b7280;">No items to display.</p>';

  // If we have a custom base template, use it
  if (customBaseTemplate) {
    let html = customBaseTemplate;
    
    // Replace variables in the base template
    html = html.replace(/{{title}}/g, title);
    html = html.replace(/{{intro_text}}/g, body);
    html = html.replace(/{{cta_text}}/g, 'Check out more content on our website');
    html = html.replace(/{{site_url}}/g, siteUrl);
    html = html.replace(/{{unsubscribe_url}}/g, unsubscribeUrl);
    html = html.replace(/{{primary_color}}/g, settings.primary_color);
    html = html.replace(/{{secondary_color}}/g, settings.secondary_color);
    html = html.replace(/{{accent_color}}/g, settings.accent_color);
    html = html.replace(/{{logo_url}}/g, settings.logo_url);
    html = html.replace(/{{current_year}}/g, new Date().getFullYear().toString());
    
    // Replace recipient name
    if (recipientName) {
      html = html.replace(/{{#if recipient_name}}([^]*){{\/if}}/g, (match, content) => {
        return content.replace(/{{recipient_name}}/g, recipientName);
      });
    } else {
      html = html.replace(/{{#if recipient_name}}([^]*){{\/if}}/g, '');
    }
    
    // Replace content cards
    html = html.replace(/{{content_cards}}/g, contentCardsHtml);
    
    // Replace header template
    if (customHeaderTemplate) {
      let headerHtml = customHeaderTemplate;
      headerHtml = headerHtml.replace(/{{title}}/g, title);
      headerHtml = headerHtml.replace(/{{logo_url}}/g, settings.logo_url);
      headerHtml = headerHtml.replace(/{{primary_color}}/g, settings.primary_color);
      
      // Handle conditional logo
      if (settings.logo_url) {
        headerHtml = headerHtml.replace(/{{#if logo_url}}([^]*){{\/if}}/g, (match, content) => {
          return content;
        });
      } else {
        headerHtml = headerHtml.replace(/{{#if logo_url}}([^]*){{\/if}}/g, '');
      }
      
      html = html.replace(/{{header_template}}/g, headerHtml);
    } else {
      const defaultHeader = `
        <div style="text-align: center; padding: 24px; margin-bottom: 24px;">
          ${settings.logo_url ? `<img src="${settings.logo_url}" alt="Logo" style="height: 40px; margin-bottom: 16px;">` : ''}
          <h1 style="margin: 0; font-size: 26px; font-weight: 600; color: ${settings.primary_color};">${title}</h1>
        </div>
      `;
      html = html.replace(/{{header_template}}/g, defaultHeader);
    }
    
    // Replace footer template
    if (customFooterTemplate) {
      let footerHtml = customFooterTemplate;
      footerHtml = footerHtml.replace(/{{current_year}}/g, new Date().getFullYear().toString());
      footerHtml = footerHtml.replace(/{{unsubscribe_url}}/g, unsubscribeUrl);
      
      html = html.replace(/{{footer_template}}/g, footerHtml);
    } else {
      const defaultFooter = `
        <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb; text-align: center;">
          <p style="color: #6b7280; font-size: 12px;">&copy; ${new Date().getFullYear()} PicoCareer. All rights reserved.</p>
          <p style="color: #6b7280; font-size: 12px;">
            <a href="${unsubscribeUrl}" style="color: #6b7280; text-decoration: underline;">Unsubscribe</a> from these emails
          </p>
        </div>
      `;
      html = html.replace(/{{footer_template}}/g, defaultFooter);
    }
    
    return html;
  }

  // Otherwise, use the default template structure
  const header = generateHeader(
    title,
    settings.layout_settings.headerStyle,
    settings,
    settings.logo_url
  );

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
    case 'events':
      return `🗓️ Upcoming Events Selected For You, ${nameSection}`;
    default:
      return `New Content Updates for You, ${nameSection}`;
  }
}

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
