
import type { ContentItem } from "@/types/database/email";

interface LayoutSettings {
  headerStyle: 'centered' | 'banner' | 'minimal';
  showAuthor: boolean;
  showDate: boolean;
  imagePosition: 'top' | 'inline' | 'side';
  contentBlocks?: string[];
  metadataDisplay?: string[];
}

export function formatContentCard(
  content: ContentItem, 
  contentType: string, 
  siteUrl: string,
  styles: { primary: string, secondary: string, accent: string },
  layoutSettings?: LayoutSettings
): string {
  if (!content) return '';
  
  const contentUrl = `${siteUrl}/${contentType}/${content.id}`;
  const description = content.description?.slice(0, 150) + (content.description?.length > 150 ? '...' : '');

  // Use layout settings or defaults
  const settings = layoutSettings || {
    headerStyle: 'centered',
    showAuthor: true,
    showDate: true,
    imagePosition: 'top',
    contentBlocks: ['title', 'image', 'description', 'cta'],
    metadataDisplay: ['category', 'date', 'author']
  };

  let cardContent = '';

  // Handle image based on position setting
  if (settings.contentBlocks?.includes('image') && content.cover_image_url) {
    const imageHtml = `
      <img 
        src="${content.cover_image_url}" 
        alt="${content.title || 'Content'}"
        style="width: 100%; height: auto; border-radius: 8px; margin-bottom: 12px; ${
          settings.imagePosition === 'side' ? 'max-width: 200px;' : 'max-width: 100%;'
        }"
      />
    `;
    
    if (settings.imagePosition === 'top') {
      cardContent += imageHtml;
    }
  }

  // Title
  if (settings.contentBlocks?.includes('title')) {
    cardContent += `
      <h3 style="margin-top: 0; margin-bottom: 8px; font-size: 18px; color: ${styles.primary};">
        ${content.title}
      </h3>
    `;
  }

  // Metadata (author, date, etc)
  if (settings.metadataDisplay?.length) {
    cardContent += formatMetadata(content, contentType, settings, styles);
  }

  // Description
  if (settings.contentBlocks?.includes('description') && description) {
    cardContent += `
      <p style="color: #4B5563; font-size: 14px; line-height: 1.6; margin: 8px 0;">
        ${description}
      </p>
    `;
  }

  // CTA
  if (settings.contentBlocks?.includes('cta')) {
    cardContent += `
      <div style="margin-top: 16px;">
        <a 
          href="${contentUrl}" 
          style="display: inline-block; background-color: ${styles.accent}; color: white; padding: 8px 16px; 
                 text-decoration: none; border-radius: 6px; font-size: 14px; font-weight: 500;"
        >
          Learn More
        </a>
      </div>
    `;
  }

  return `
    <div style="margin-bottom: 24px; border: 1px solid #e5e7eb; border-radius: 8px; overflow: hidden; 
                background-color: white; ${settings.headerStyle === 'banner' ? `border-top: 4px solid ${styles.primary};` : ''}">
      <div style="padding: 16px;">
        ${cardContent}
      </div>
    </div>
  `;
}

function formatMetadata(
  content: ContentItem,
  contentType: string,
  settings: LayoutSettings,
  styles: { primary: string, secondary: string, accent: string }
): string {
  const metadataHtml = [];

  if (settings.metadataDisplay?.includes('author') && content.author_name) {
    metadataHtml.push(`<span style="font-weight: 500;">By ${content.author_name}</span>`);
  }

  if (settings.metadataDisplay?.includes('date') && content.created_at) {
    metadataHtml.push(new Date(content.created_at).toLocaleDateString());
  }

  if (settings.metadataDisplay?.includes('category') && content.category) {
    metadataHtml.push(`<span style="color: ${styles.accent};">${content.category}</span>`);
  }

  return metadataHtml.length ? `
    <div style="font-size: 14px; color: #6B7280; margin: 4px 0;">
      ${metadataHtml.join(' • ')}
    </div>
  ` : '';
}
