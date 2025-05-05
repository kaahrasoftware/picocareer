
import { ContentItem } from "@/types/database/email";

export function formatContentCard(
  content: ContentItem, 
  contentType: string, 
  siteUrl: string,
  styles: { primary: string; secondary: string; accent: string },
  layoutSettings?: {
    imagePosition: 'top' | 'inline' | 'side';
    showDate: boolean;
    showAuthor: boolean;
    contentBlocks: string[];
    metadataDisplay: string[];
  }
): string {
  if (!content) return '';
  
  const defaultLayoutSettings = {
    imagePosition: 'top' as const,
    showDate: true,
    showAuthor: true,
    contentBlocks: ['title', 'image', 'description', 'metadata', 'cta'],
    metadataDisplay: ['category', 'date', 'author']
  };
  
  // Use provided layout settings or defaults
  const settings = layoutSettings || defaultLayoutSettings;
  
  // Get the content image
  const imageUrl = content.cover_image_url || content.image_url || content.avatar_url || '';
  const title = content.title || (contentType === 'schools' ? content.name : 'Untitled');
  
  // Truncate description if it's too long
  const description = content.description 
    ? (content.description.length > 150 ? content.description.substring(0, 147) + '...' : content.description)
    : '';
  
  // Format display based on content type
  let metadataHtml = '';
  
  // Show image based on layout settings
  const showImage = settings.contentBlocks.includes('image') && imageUrl;
  const imageHtml = showImage ? `
    <img 
      src="${imageUrl}" 
      alt="${title}"
      style="width: 100%; height: auto; border-radius: 8px; margin-bottom: 12px; object-fit: cover; max-height: 200px;"
    />
  ` : '';
  
  // Add type-specific metadata if layout includes it
  if (settings.contentBlocks.includes('metadata')) {
    switch (contentType) {
      case 'scholarships':
        if (content.provider_name) {
          metadataHtml += `<p style="font-size: 14px; color: #6b7280; margin-bottom: 4px;">Provider: ${content.provider_name}</p>`;
        }
        if (content.amount) {
          metadataHtml += `<p style="font-size: 14px; color: #6b7280; margin-bottom: 4px;">Amount: $${content.amount}</p>`;
        }
        if (content.deadline) {
          metadataHtml += `<p style="font-size: 14px; color: #6b7280;">Deadline: ${new Date(content.deadline).toLocaleDateString()}</p>`;
        }
        break;
        
      case 'opportunities':
        if (content.provider_name) {
          metadataHtml += `<p style="font-size: 14px; color: #6b7280; margin-bottom: 4px;">Provider: ${content.provider_name}</p>`;
        }
        if (content.compensation) {
          metadataHtml += `<p style="font-size: 14px; color: #6b7280; margin-bottom: 4px;">Compensation: ${content.compensation}</p>`;
        }
        if (content.location) {
          const remoteLabel = content.remote ? " (Remote available)" : "";
          metadataHtml += `<p style="font-size: 14px; color: #6b7280;">Location: ${content.location}${remoteLabel}</p>`;
        }
        break;
        
      case 'careers':
        if (content.industry) {
          metadataHtml += `<p style="font-size: 14px; color: #6b7280; margin-bottom: 4px;">Industry: ${content.industry}</p>`;
        }
        if (content.salary_range) {
          metadataHtml += `<p style="font-size: 14px; color: #6b7280;">Salary Range: ${content.salary_range}</p>`;
        }
        break;
        
      case 'mentors':
        if (content.skills && Array.isArray(content.skills) && content.skills.length > 0) {
          metadataHtml += `<p style="font-size: 14px; color: #6b7280; margin-bottom: 4px;">Skills: ${content.skills.slice(0, 3).join(', ')}</p>`;
        }
        if (content.location) {
          metadataHtml += `<p style="font-size: 14px; color: #6b7280;">Location: ${content.location}</p>`;
        }
        break;
        
      case 'events':
        if (content.start_time) {
          metadataHtml += `<p style="font-size: 14px; color: #6b7280; margin-bottom: 4px;">Date: ${new Date(content.start_time).toLocaleDateString()}</p>`;
        }
        if (content.organized_by) {
          metadataHtml += `<p style="font-size: 14px; color: #6b7280;">Organized by: ${content.organized_by}</p>`;
        }
        break;
        
      case 'schools':
        if (content.type) {
          metadataHtml += `<p style="font-size: 14px; color: #6b7280; margin-bottom: 4px;">Type: ${content.type}</p>`;
        }
        if (content.location) {
          metadataHtml += `<p style="font-size: 14px; color: #6b7280;">Location: ${content.location}</p>`;
        }
        break;
        
      case 'majors':
        if (content.potential_salary) {
          metadataHtml += `<p style="font-size: 14px; color: #6b7280; margin-bottom: 4px;">Potential Salary: ${content.potential_salary}</p>`;
        }
        if (content.category && Array.isArray(content.category)) {
          metadataHtml += `<p style="font-size: 14px; color: #6b7280;">Category: ${content.category.join(', ')}</p>`;
        }
        break;

      case 'blogs':
        if (content.categories && Array.isArray(content.categories)) {
          metadataHtml += `<p style="font-size: 14px; color: #6b7280; margin-bottom: 4px;">Categories: ${content.categories.join(', ')}</p>`;
        }
        break;
    }
  }

  return `
    <div style="margin-bottom: 24px; border: 1px solid #e5e7eb; border-radius: 12px; overflow: hidden; background-color: white;">
      <div style="padding: 16px;">
        ${imageHtml}
        <h3 style="margin-top: 0; margin-bottom: 8px; font-size: 18px; color: ${styles.accent};">
          ${title}
        </h3>
        ${metadataHtml}
        ${description && settings.contentBlocks.includes('description') ? `
          <p style="color: #4b5563; margin-bottom: 12px; font-size: 14px;">
            ${description}
          </p>
        ` : ''}
        ${settings.contentBlocks.includes('cta') ? `
          <div style="margin-top: 16px;">
            <a 
              href="${siteUrl}/${contentType}/${content.id}" 
              style="display: inline-block; background: linear-gradient(135deg, ${styles.primary}, ${styles.secondary}); color: white; padding: 8px 16px; text-decoration: none; border-radius: 6px; font-weight: 500;"
            >
              Learn More
            </a>
          </div>
        ` : ''}
      </div>
    </div>
  `;
}
