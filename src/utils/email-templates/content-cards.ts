
import type { ContentItem } from "@/types/database/email";

export function formatContentCard(content: ContentItem, contentType: string, siteUrl: string): string {
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
      
    // Add other content types as needed
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
}

