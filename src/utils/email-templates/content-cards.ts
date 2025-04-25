
import type { ContentItem } from "@/types/database/email";
import { getContentTypeStyles } from "./styles";

export function formatContentCard(content: ContentItem, contentType: string, siteUrl: string): string {
  if (!content) return '';
  
  const styles = getContentTypeStyles(contentType);
  const contentUrl = `${siteUrl}/${contentType}/${content.id}`;
  const description = content.description?.slice(0, 150) + (content.description?.length > 150 ? '...' : '');
  
  return `
    <div style="margin-bottom: 32px; border: 1px solid #e5e7eb; border-radius: 12px; overflow: hidden; background-color: white;">
      <div style="padding: 24px;">
        ${content.cover_image_url ? `
          <img 
            src="${content.cover_image_url}" 
            alt="${content.title || 'Content'}"
            style="width: 100%; height: 200px; object-fit: cover; border-radius: 8px; margin-bottom: 20px;"
          />
        ` : ''}
        
        <h2 style="margin: 0 0 16px 0; font-size: 24px; color: ${styles.accent}; font-weight: 600;">
          ${content.title}
        </h2>

        ${description ? `
          <p style="color: #4b5563; margin: 0 0 20px 0; font-size: 16px; line-height: 1.6;">
            ${description}
          </p>
        ` : ''}

        ${formatMetadata(content, contentType)}

        <div style="margin-top: 24px;">
          <a 
            href="${contentUrl}" 
            style="display: inline-block; ${styles.gradient}; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: 500; font-size: 16px;"
          >
            ${getActionButtonText(contentType)} →
          </a>
        </div>
      </div>
    </div>
  `;
}

function formatMetadata(content: ContentItem, contentType: string): string {
  const metadataItems: string[] = [];

  switch(contentType) {
    case 'scholarships':
      if (content.provider_name) {
        metadataItems.push(createMetadataItem('Provider', content.provider_name));
      }
      if (content.amount) {
        metadataItems.push(createMetadataItem('Amount', formatAmount(content.amount), 'text-green-600'));
      }
      if (content.deadline) {
        metadataItems.push(createMetadataItem('Deadline', formatDate(content.deadline), 'text-red-600'));
      }
      break;
      
    case 'opportunities':
      if (content.provider_name) {
        metadataItems.push(createMetadataItem('Company', content.provider_name));
      }
      if (content.location) {
        metadataItems.push(createMetadataItem('Location', `${content.location}${content.remote ? ' (Remote available)' : ''}`));
      }
      if (content.compensation) {
        metadataItems.push(createMetadataItem('Compensation', content.compensation));
      }
      break;
      
    case 'mentors':
      if (content.position) {
        metadataItems.push(createMetadataItem('Position', content.position));
      }
      if (content.company_name) {
        metadataItems.push(createMetadataItem('Company', content.company_name));
      }
      break;
  }

  return metadataItems.length > 0 
    ? `<div style="margin: 20px 0;">${metadataItems.join('')}</div>`
    : '';
}

function createMetadataItem(label: string, value: string, textColor: string = 'text-gray-900'): string {
  return `
    <div style="margin-bottom: 12px; padding: 12px; background-color: #f9fafb; border-radius: 6px;">
      <span style="font-weight: 600; color: #374151;">${label}:</span>
      <span style="color: ${textColor === 'text-gray-900' ? '#111827' : 
                           textColor === 'text-green-600' ? '#059669' :
                           textColor === 'text-red-600' ? '#DC2626' : '#374151'};">
        ${value}
      </span>
    </div>
  `;
}

function formatAmount(amount: number | string): string {
  if (typeof amount === 'number') {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  }
  return amount;
}

function formatDate(date: string): string {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
}

function getActionButtonText(contentType: string): string {
  switch(contentType) {
    case 'scholarships':
      return 'Apply Now';
    case 'opportunities':
      return 'View Opportunity';
    case 'careers':
      return 'Explore Career';
    case 'majors':
      return 'Learn More';
    case 'schools':
      return 'View School';
    case 'mentors':
      return 'Connect';
    case 'blogs':
      return 'Read More';
    default:
      return 'View Details';
  }
}
