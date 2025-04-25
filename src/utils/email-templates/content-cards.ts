import { ContentItem } from "@/types/database/email";
import { getContentTypeStyles } from "./styles";

export function formatContentCard(content: ContentItem, contentType: string, siteUrl: string): string {
  if (!content) return '';
  
  const styles = getContentTypeStyles(contentType);
  const contentUrl = `${siteUrl}/${contentType}/${content.id}`;
  const description = content.description?.slice(0, 150) + (content.description?.length > 150 ? '...' : '');

  return `
    <div style="margin-bottom: 24px; border: 1px solid #e5e7eb; border-radius: 8px; background: white; border-left: 4px solid ${styles.accent};">
      <div style="padding: 20px;">
        <div style="margin-bottom: 12px;">
          <h3 style="margin: 0 0 8px 0; font-size: 18px; font-weight: 600; color: ${styles.accent};">
            ${content.title}
          </h3>
          ${formatMetadata(content, contentType)}
        </div>

        ${description ? `
          <p style="color: #4B5563; font-size: 14px; line-height: 1.6; margin: 0 0 16px 0;">
            ${description}
          </p>
        ` : ''}

        <a 
          href="${contentUrl}" 
          style="display: inline-block; color: ${styles.accent}; font-size: 14px; font-weight: 500; text-decoration: none;"
        >
          View Details →
        </a>
      </div>
    </div>
  `;
}

function formatMetadata(content: ContentItem, contentType: string): string {
  let metadataHtml = '';

  if (contentType === 'scholarships') {
    if (content.provider_name) {
      metadataHtml += `
        <p style="font-size: 14px; color: #6B7280; margin: 0 0 4px 0;">
          ${content.provider_name}
          ${content.amount ? ` • <span style="color: #047857;">$${Number(content.amount).toLocaleString()}</span>` : ''}
        </p>
      `;
    }
    if (content.deadline) {
      metadataHtml += `
        <p style="font-size: 14px; color: #DC2626; margin: 4px 0 0 0;">
          Deadline: ${new Date(content.deadline).toLocaleDateString()}
        </p>
      `;
    }
  }

  if (contentType === 'opportunities') {
    if (content.provider_name) {
      metadataHtml += `
        <p style="font-size: 14px; color: #6B7280; margin: 0 0 4px 0;">
          ${content.provider_name}
        </p>
      `;
    }
    if (content.location) {
      metadataHtml += `
        <p style="font-size: 14px; color: #6B7280; margin: 4px 0 0 0;">
          ${content.location} ${content.remote ? '(Remote)' : ''}
        </p>
      `;
    }
  }

  return metadataHtml;
}
