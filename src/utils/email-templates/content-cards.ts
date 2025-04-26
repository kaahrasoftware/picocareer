import type { ContentItem, EmailContentTypeSettings } from "@/types/database/email";

interface EmailStyles {
  primary: string;
  secondary: string;
  accent: string;
}

function formatMetadata(
  item: ContentItem,
  contentType: string,
  settings: EmailContentTypeSettings,
  styles: EmailStyles
): string {
  const metadataItems: string[] = [];

  if (settings.layout_settings?.metadataDisplay?.includes('date') && item.created_at) {
    metadataItems.push(new Date(item.created_at).toLocaleDateString());
  }

  switch (contentType) {
    case 'careers':
      if (item.salary_range) {
        metadataItems.push(`💰 ${item.salary_range}`);
      }
      if (item.industry) {
        metadataItems.push(`🏢 ${item.industry}`);
      }
      if (item.location) {
        const locationText = item.remote ? `${item.location} (Remote available)` : item.location;
        metadataItems.push(`📍 ${locationText}`);
      }
      break;

    case 'scholarships':
      if (item.amount) {
        metadataItems.push(`💰 $${item.amount}`);
      }
      if (item.provider_name) {
        metadataItems.push(`🏢 ${item.provider_name}`);
      }
      if (item.deadline) {
        metadataItems.push(`⏰ Deadline: ${new Date(item.deadline).toLocaleDateString()}`);
      }
      break;

    case 'opportunities':
      if (item.provider_name) {
        metadataItems.push(`🏢 ${item.provider_name}`);
      }
      if (item.compensation) {
        metadataItems.push(`💰 ${item.compensation}`);
      }
      if (item.location) {
        const locationText = item.remote ? `${item.location} (Remote available)` : item.location;
        metadataItems.push(`📍 ${locationText}`);
      } else if (item.remote) {
        metadataItems.push(`🌐 Remote`);
      }
      break;
  }

  return metadataItems.length ? `
    <div style="color: #6b7280; font-size: 14px; margin: 8px 0;">
      ${metadataItems.join(' • ')}
    </div>
  ` : '';
}

export function formatContentCard(
  item: ContentItem,
  contentType: string,
  styles: EmailStyles,
  settings: EmailContentTypeSettings
): string {
  if (!item) return '';

  const imageHtml = item.cover_image_url || item.image_url ? `
    <img 
      src="${item.cover_image_url || item.image_url}"
      alt="${item.title}"
      style="width: 100%; height: auto; border-radius: 8px; margin-bottom: 12px; 
             ${settings.layout_settings?.imagePosition === 'side' ? 'max-width: 200px;' : 'max-width: 100%;'}"
    />
  ` : '';

  let contentHtml = '';
  const blocks = settings.layout_settings?.contentBlocks || ['title', 'image', 'description', 'metadata', 'cta'];
  
  blocks.forEach(block => {
    switch (block) {
      case 'title':
        contentHtml += `
          <h3 style="margin: 0 0 8px 0; font-size: 18px; font-weight: 600; color: ${styles.primary};">
            ${item.title}
          </h3>
        `;
        break;
      case 'image':
        if (settings.layout_settings?.imagePosition === 'top') {
          contentHtml += imageHtml;
        }
        break;
      case 'description':
        if (item.description) {
          const desc = item.description.length > 150 
            ? item.description.substring(0, 147) + '...' 
            : item.description;
          contentHtml += `
            <p style="margin: 8px 0; color: #4b5563; font-size: 14px; line-height: 1.5;">
              ${desc}
            </p>
          `;
        }
        break;
      case 'metadata':
        contentHtml += formatMetadata(item, contentType, settings, styles);
        break;
      case 'cta':
        contentHtml += `
          <div style="margin-top: 16px;">
            <a 
              href="#" 
              style="display: inline-block; background-color: ${styles.accent}; color: white; 
                     padding: 8px 16px; text-decoration: none; border-radius: 6px; 
                     font-size: 14px; font-weight: 500;"
            >
              Learn More
            </a>
          </div>
        `;
        break;
    }
  });

  const wrapperStyle = settings.layout_settings?.imagePosition === 'side'
    ? 'display: flex; align-items: start; gap: 16px;'
    : '';

  return `
    <div style="margin-bottom: 24px; border: 1px solid #e5e7eb; border-radius: 8px; 
                overflow: hidden; background-color: white; padding: 16px;">
      <div style="${wrapperStyle}">
        ${settings.layout_settings?.imagePosition === 'side' ? imageHtml : ''}
        <div style="flex: 1;">
          ${contentHtml}
        </div>
      </div>
    </div>
  `;
}
