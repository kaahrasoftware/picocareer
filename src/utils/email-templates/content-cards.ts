import type { ContentItem, EmailContentTypeSettings } from "@/types/database/email";

interface EmailStyles {
  primary: string;
  secondary: string;
  accent: string;
}

export function formatContentCard(
  item: ContentItem,
  contentType: string,
  styles: EmailStyles,
  settings?: EmailContentTypeSettings['layout_settings']
): string {
  if (!item) return '';

  // Default settings if none provided
  const layout = settings || {
    headerStyle: 'centered',
    showAuthor: true,
    showDate: true,
    imagePosition: 'top',
    contentBlocks: ['title', 'image', 'description', 'metadata', 'cta'],
    metadataDisplay: ['category', 'date', 'author']
  };

  // Ensure the layout.contentBlocks exists before trying to use it
  const contentBlocks = layout.contentBlocks || ['title', 'image', 'description', 'metadata', 'cta'];
  const metadataDisplay = layout.metadataDisplay || ['category', 'date', 'author'];
  
  const imageHtml = (item.cover_image_url || item.image_url) ? `
    <img 
      src="${item.cover_image_url || item.image_url}"
      alt="${item.title}"
      style="${getImageStyles(layout.imagePosition)}"
    />
  ` : '';

  const contentBlockMapping: { [key: string]: () => string } = {
    title: () => `
      <h3 style="margin-top: 0; margin-bottom: 8px; font-size: 18px; color: ${styles.accent};">
        ${item.title}
      </h3>
    `,
    image: () => imageHtml,
    description: () => item.description ? `
      <p style="color: #4b5563; margin: 8px 0; font-size: 14px; line-height: 1.5;">
        ${item.description.length > 150 ? item.description.substring(0, 147) + '...' : item.description}
      </p>
    ` : '',
    metadata: () => generateMetadata(item, contentType, metadataDisplay),
    cta: () => `
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
    `
  };

  let contentHtml = '';

  if (layout.imagePosition === 'side') {
    // Special handling for side layout
    const imageContent = contentBlockMapping['image']();
    const otherBlocks = contentBlocks
      .filter(block => block !== 'image')
      .map(block => contentBlockMapping[block] ? contentBlockMapping[block]() : '')
      .join('');

    contentHtml = `
      <div style="display: flex; gap: 16px; align-items: start;">
        <div style="flex-shrink: 0; width: 200px;">
          ${imageContent}
        </div>
        <div style="flex: 1;">
          ${otherBlocks}
        </div>
      </div>
    `;
  } else {
    // Standard layout
    contentHtml = contentBlocks
      .map(block => contentBlockMapping[block] ? contentBlockMapping[block]() : '')
      .join('');
  }

  return `
    <div style="margin-bottom: 24px; border: 1px solid #e5e7eb; border-radius: 8px; 
                overflow: hidden; background-color: white; padding: 16px;">
      ${contentHtml}
    </div>
  `;
}

function getImageStyles(position: 'top' | 'inline' | 'side' = 'top'): string {
  switch (position) {
    case 'side':
      return 'width: 100%; height: auto; border-radius: 8px; margin-right: 16px;';
    case 'inline':
      return 'width: 60%; height: auto; border-radius: 8px; margin: 12px auto; display: block;';
    case 'top':
    default:
      return 'width: 100%; height: auto; border-radius: 8px; margin-bottom: 12px;';
  }
}

function generateMetadata(
  item: ContentItem,
  contentType: string,
  metadataDisplay?: string[]
): string {
  if (!metadataDisplay || !metadataDisplay.length) return '';

  const metadataItems: string[] = [];

  if (metadataDisplay.includes('date') && item.created_at) {
    metadataItems.push(`📅 ${new Date(item.created_at).toLocaleDateString()}`);
  }

  if (metadataDisplay.includes('author') && item.author_name) {
    metadataItems.push(`👤 ${item.author_name}`);
  }

  // Content type specific metadata
  switch (contentType) {
    case 'scholarships':
      if (metadataDisplay.includes('amount') && item.amount) {
        metadataItems.push(`💰 $${item.amount}`);
      }
      if (metadataDisplay.includes('provider') && item.provider_name) {
        metadataItems.push(`🏢 ${item.provider_name}`);
      }
      if (metadataDisplay.includes('deadline') && item.deadline) {
        metadataItems.push(`⏰ Deadline: ${new Date(item.deadline).toLocaleDateString()}`);
      }
      break;
      
    case 'opportunities':
      if (metadataDisplay.includes('compensation') && item.compensation) {
        metadataItems.push(`💰 ${item.compensation}`);
      }
      if (metadataDisplay.includes('location') && item.location) {
        const locationText = item.remote ? `${item.location} (Remote)` : item.location;
        metadataItems.push(`📍 ${locationText}`);
      }
      break;
  }

  return metadataItems.length ? `
    <div style="color: #6b7280; font-size: 14px; margin: 8px 0;">
      ${metadataItems.join(' • ')}
    </div>
  ` : '';
}
