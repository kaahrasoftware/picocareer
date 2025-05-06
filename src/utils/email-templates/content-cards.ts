
import { ContentItem } from "@/types/database/email";
import { getContentTypeStyles } from "./styles";

/**
 * Formats a content item into an HTML card for email templates
 */
export function formatContentCard(
  item: ContentItem,
  contentType: string,
  siteUrl: string,
  styles: { primary: string; secondary: string; accent: string },
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

  // Get the formatted date if available
  const formattedDate = item.created_at 
    ? new Date(item.created_at).toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric' 
      })
    : '';

  // Get display properties based on content type
  const title = item.title || `Untitled ${contentType}`;
  const description = item.description || '';
  const imageUrl = item.cover_image_url || item.image_url || '';
  const author = item.author_name || '';
  const category = Array.isArray(item.categories) && item.categories.length > 0 
    ? item.categories[0] 
    : contentType;

  // Determine the content link - with special handling for scholarships
  let contentLink = `${siteUrl}`;
  switch (contentType) {
    case 'scholarships':
      contentLink += `/scholarships?dialog=${item.id}`;
      break;
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

  // Scholarship amount highlight for scholarships
  let scholarshipAmountHighlight = '';
  if (contentType === 'scholarships' && item.amount) {
    scholarshipAmountHighlight = `
      <div style="position: absolute; top: 10px; right: 10px; background-color: ${styles.accent}; color: white; 
                  padding: 5px 10px; border-radius: 20px; font-weight: bold; font-size: 14px;">
        $${item.amount.toLocaleString()}
      </div>
    `;
  }

  // Build and return the HTML for the content card
  return `
    <div style="margin-bottom: 32px; background-color: white; border-radius: 8px; overflow: hidden; box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1); position: relative;">
      ${contentType === 'scholarships' ? scholarshipAmountHighlight : ''}
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
            <a href="${contentLink}" style="color: ${styles.primary}; text-decoration: none;">
              ${title}
            </a>
          </h2>
        ` : ''}
        
        ${settings.contentBlocks?.includes('metadata') ? `
          <div style="display: flex; flex-wrap: wrap; gap: 12px; margin-bottom: 12px; font-size: 12px; color: #6b7280;">
            ${settings.metadataDisplay?.includes('category') ? `
              <span style="color: ${styles.accent}; font-weight: 500;">${category}</span>
            ` : ''}
            
            ${settings.metadataDisplay?.includes('date') && formattedDate ? `
              <span>${formattedDate}</span>
            ` : ''}
            
            ${settings.metadataDisplay?.includes('author') && author ? `
              <span>By ${author}</span>
            ` : ''}
            
            ${contentType === 'scholarships' && item.amount ? `
              <span style="font-weight: bold; color: ${styles.primary};">Amount: $${item.amount.toLocaleString()}</span>
            ` : ''}
            
            ${contentType === 'scholarships' && item.deadline ? `
              <span style="color: #ef4444;">Deadline: ${new Date(item.deadline).toLocaleDateString()}</span>
            ` : ''}
          </div>
        ` : ''}
        
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
        
        ${contentType === 'scholarships' ? `
          <div style="margin: 10px 0; padding: 10px; background-color: #f9fafb; border-radius: 4px;">
            ${item.provider_name ? `<p style="margin: 0; font-size: 14px;"><strong>Provider:</strong> ${item.provider_name}</p>` : ''}
          </div>
        ` : ''}
        
        ${settings.contentBlocks?.includes('cta') ? `
          <a 
            href="${contentLink}" 
            style="display: inline-block; padding: 8px 16px; background-color: ${styles.accent}; color: white; 
                  text-decoration: none; border-radius: 4px; font-size: 14px; font-weight: 500;"
          >
            ${contentType === 'scholarships' ? 'Apply Now' : 'Read More'}
          </a>
        ` : ''}
      </div>
    </div>
  `;
}
