
import type { ContentItem } from "@/types/database/email";
import { getContentTypeStyles } from "./styles";

export function formatContentCard(content: ContentItem, contentType: string, siteUrl: string): string {
  if (!content) return '';
  
  const styles = getContentTypeStyles(contentType);
  const contentUrl = `${siteUrl}/${contentType}/${content.id}`;
  
  const description = content.description?.slice(0, 300) + (content.description?.length > 300 ? '...' : '');
  
  return `
    <div style="margin-bottom: 32px; border: 1px solid #e5e7eb; border-radius: 12px; overflow: hidden; background-color: white; box-shadow: 0 2px 4px rgba(0,0,0,0.05);">
      <div style="padding: 24px;">
        ${content.cover_image_url ? `
          <img 
            src="${content.cover_image_url}" 
            alt="${content.title || 'Content'}"
            style="width: 100%; height: auto; border-radius: 8px; margin-bottom: 16px; max-width: 600px;"
          />
        ` : ''}
        
        <h2 style="margin: 0 0 16px 0; font-size: 24px; color: ${styles.accent}; font-weight: 600;">
          ${content.title}
        </h2>

        ${description ? `
          <div style="color: #4b5563; margin: 16px 0; font-size: 16px; line-height: 1.6;">
            ${description}
          </div>
        ` : ''}

        ${content.provider_name ? `
          <div style="margin-bottom: 12px; padding: 8px 12px; background-color: #f9fafb; border-radius: 6px;">
            <span style="font-weight: 600; color: #374151;">Provider:</span>
            <span style="color: #4b5563;"> ${content.provider_name}</span>
          </div>
        ` : ''}

        ${typeof content.amount !== 'undefined' ? `
          <div style="margin-bottom: 12px; padding: 8px 12px; background-color: #f9fafb; border-radius: 6px;">
            <span style="font-weight: 600; color: #374151;">Amount:</span>
            <span style="font-weight: 600; color: #16a34a;"> ${typeof content.amount === 'number' 
              ? content.amount.toLocaleString('en-US', { style: 'currency', currency: 'USD' })
              : content.amount}</span>
          </div>
        ` : ''}

        ${content.deadline ? `
          <div style="margin-bottom: 12px; padding: 8px 12px; background-color: #f9fafb; border-radius: 6px;">
            <span style="font-weight: 600; color: #374151;">Deadline:</span>
            <span style="font-weight: 600; color: #dc2626;"> ${new Date(content.deadline).toLocaleDateString('en-US', { 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}</span>
          </div>
        ` : ''}

        <div style="margin-top: 24px;">
          <a 
            href="${contentUrl}" 
            style="display: inline-block; ${styles.gradient}; color: white; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: 500; font-size: 16px; transition: opacity 0.2s ease;"
            onmouseover="this.style.opacity='0.9'"
            onmouseout="this.style.opacity='1'"
          >
            Apply Now →
          </a>
        </div>
      </div>
    </div>
  `;
}
