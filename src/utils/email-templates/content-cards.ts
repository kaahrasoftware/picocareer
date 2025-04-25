import type { ContentItem } from "@/types/database/email";
import { getContentTypeStyles } from "./styles";

export function formatContentCard(content: ContentItem, contentType: string, siteUrl: string): string {
  if (!content) return '';
  
  const styles = getContentTypeStyles(contentType);
  const contentUrl = `${siteUrl}/${contentType}/${content.id}`;
  
  if (contentType === 'scholarships') {
    const amount = typeof content.amount === 'number' 
      ? content.amount.toLocaleString('en-US', { style: 'currency', currency: 'USD' })
      : content.amount;
      
    const deadline = content.deadline 
      ? new Date(content.deadline).toLocaleDateString('en-US', { 
          year: 'numeric', 
          month: 'long', 
          day: 'numeric' 
        })
      : 'No deadline specified';

    return `
      <div style="margin-bottom: 32px; border: 1px solid #e5e7eb; border-radius: 12px; overflow: hidden; background-color: white; box-shadow: 0 2px 4px rgba(0,0,0,0.05);">
        <div style="padding: 24px;">
          ${content.cover_image_url ? `
            <img 
              src="${content.cover_image_url}" 
              alt="${content.title || 'Scholarship'}"
              style="width: 100%; height: auto; border-radius: 8px; margin-bottom: 16px; max-width: 600px;"
            />
          ` : ''}
          <h2 style="margin: 0 0 16px 0; font-size: 24px; color: ${styles.accent}; font-weight: 600;">
            ${content.title}
          </h2>

          ${content.provider_name ? `
            <div style="margin-bottom: 12px; padding: 8px 12px; background-color: #f9fafb; border-radius: 6px;">
              <span style="font-weight: 600; color: #374151;">Provider:</span>
              <span style="color: #4b5563;"> ${content.provider_name}</span>
            </div>
          ` : ''}

          ${amount ? `
            <div style="margin-bottom: 12px; padding: 8px 12px; background-color: #f9fafb; border-radius: 6px;">
              <span style="font-weight: 600; color: #374151;">Amount:</span>
              <span style="font-weight: 600; color: #16a34a;"> ${amount}</span>
            </div>
          ` : ''}

          ${deadline ? `
            <div style="margin-bottom: 12px; padding: 8px 12px; background-color: #f9fafb; border-radius: 6px;">
              <span style="font-weight: 600; color: #374151;">Deadline:</span>
              <span style="font-weight: 600; color: #dc2626;"> ${deadline}</span>
            </div>
          ` : ''}

          ${content.description ? `
            <div style="color: #4b5563; margin: 16px 0; font-size: 16px; line-height: 1.6;">
              ${content.description.slice(0, 300)}${content.description.length > 300 ? '...' : ''}
            </div>
          ` : ''}

          <div style="margin-top: 24px;">
            <a 
              href="${contentUrl}" 
              style="display: inline-block; ${styles.gradient}; color: white; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: 500; font-size: 16px; transition: opacity 0.2s ease;"
            >
              Apply Now →
            </a>
          </div>
        </div>
      </div>
    `;
  }

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
