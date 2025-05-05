
import type { ContentItem, EmailContentTypeSettings } from "@/types/database/email";

interface EmailStyles {
  primary: string;
  secondary: string;
  accent: string;
}

function getDialogUrl(contentType: string, id: string, siteUrl: string = 'https://picocareer.com'): string {
  switch (contentType) {
    case 'blogs':
      return `${siteUrl}/blog?dialog=true&blogId=${id}`;
    case 'careers':
      return `${siteUrl}/career?dialog=true&careerId=${id}`;
    case 'majors':
      return `${siteUrl}/program?dialog=true&majorId=${id}`;
    case 'mentors':
      return `${siteUrl}/mentor?dialog=true&mentorId=${id}`;
    case 'scholarships':
      return `${siteUrl}/scholarships?dialog=true&scholarshipId=${id}`;
    case 'opportunities':
      return `${siteUrl}/opportunities?dialog=true&opportunityId=${id}`;
    default:
      return `${siteUrl}/${contentType}/${id}`;
  }
}

export function formatContentCard(
  item: ContentItem,
  contentType: string,
  styles: EmailStyles,
  settings?: EmailContentTypeSettings['layout_settings'],
  siteUrl: string = 'https://picocareer.com'
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

  const imageUrl = item.cover_image_url || item.image_url || '';
  const imageHtml = imageUrl ? `
    <img 
      src="${imageUrl}"
      alt="${item.title || 'Content'}"
      style="${getImageStyles(layout.imagePosition)}"
    />
  ` : '';

  // Generate metadata based on content type
  function generateMetadata(item: ContentItem, contentType: string, displayFields?: string[]): string {
    let metadataHtml = '';
    
    switch(contentType) {
      case 'scholarships':
        if (item.provider_name) metadataHtml += `<p style="font-size: 14px; color: #6b7280; margin-bottom: 4px;">Provider: ${item.provider_name}</p>`;
        if (item.amount) metadataHtml += `<p style="font-size: 14px; color: #6b7280; margin-bottom: 4px;">Amount: $${item.amount}</p>`;
        if (item.deadline) metadataHtml += `<p style="font-size: 14px; color: #6b7280;">Deadline: ${new Date(item.deadline).toLocaleDateString()}</p>`;
        break;
        
      case 'opportunities':
        if (item.provider_name) metadataHtml += `<p style="font-size: 14px; color: #6b7280; margin-bottom: 4px;">Provider: ${item.provider_name}</p>`;
        if (item.compensation) metadataHtml += `<p style="font-size: 14px; color: #6b7280; margin-bottom: 4px;">Compensation: ${item.compensation}</p>`;
        if (item.location) {
          const locationText = item.remote ? `${item.location} (Remote available)` : item.location;
          metadataHtml += `<p style="font-size: 14px; color: #6b7280;">Location: ${locationText}</p>`;
        }
        break;
        
      case 'careers':
        if (item.salary_range) metadataHtml += `<p style="font-size: 14px; color: #6b7280; margin-bottom: 4px;">Salary: ${item.salary_range}</p>`;
        if (item.company_name) metadataHtml += `<p style="font-size: 14px; color: #6b7280; margin-bottom: 4px;">Company: ${item.company_name}</p>`;
        if (item.location) metadataHtml += `<p style="font-size: 14px; color: #6b7280;">Location: ${item.location}</p>`;
        break;
    }
    
    return metadataHtml;
  }

  // Determine image styles based on position
  function getImageStyles(position: string): string {
    switch (position) {
      case 'side':
        return "width: 30%; float: left; margin-right: 15px; border-radius: 8px;";
      case 'inline':
        return "width: 50%; margin: 0 auto 15px; display: block; border-radius: 8px;";
      case 'top':
      default:
        return "width: 100%; height: auto; border-radius: 8px; margin-bottom: 12px;";
    }
  }

  // Main content HTML generation
  let cardHtml = '';
  
  if (layout.imagePosition === 'side') {
    // Special layout for side-by-side image and content
    cardHtml = `
      <div style="margin-bottom: 24px; border: 1px solid #e5e7eb; border-radius: 12px; overflow: hidden; background-color: white; padding: 16px; display: table; width: 100%;">
        <div style="display: table-row;">
          ${imageUrl ? `
            <div style="display: table-cell; width: 30%; padding-right: 15px; vertical-align: top;">
              <img src="${imageUrl}" alt="${item.title || 'Content'}" style="width: 100%; border-radius: 8px;" />
            </div>
          ` : ''}
          <div style="display: table-cell; vertical-align: top; ${!imageUrl ? 'width: 100%' : ''}">
            <h3 style="margin-top: 0; margin-bottom: 8px; font-size: 18px; color: ${styles.accent};">${item.title || 'Untitled'}</h3>
            ${generateMetadata(item, contentType, layout.metadataDisplay)}
            ${item.description ? `
              <p style="color: #4b5563; margin: 8px 0; font-size: 14px; line-height: 1.5;">
                ${item.description.length > 150 ? item.description.substring(0, 147) + '...' : item.description}
              </p>
            ` : ''}
            <div style="margin-top: 12px;">
              <a 
                href="${getDialogUrl(contentType, item.id, siteUrl)}" 
                style="display: inline-block; background-color: ${styles.accent}; color: white; 
                      padding: 8px 16px; text-decoration: none; border-radius: 6px; 
                      font-size: 14px; font-weight: 500;"
              >
                Learn More
              </a>
            </div>
          </div>
        </div>
      </div>
    `;
  } else {
    // Standard layout
    cardHtml = `
      <div style="margin-bottom: 24px; border: 1px solid #e5e7eb; border-radius: 12px; overflow: hidden; background-color: white;">
        <div style="padding: 16px;">
          ${imageHtml}
          <h3 style="margin-top: 0; margin-bottom: 8px; font-size: 18px; color: ${styles.accent};">
            ${item.title || 'Untitled'}
          </h3>
          ${generateMetadata(item, contentType, layout.metadataDisplay)}
          ${item.description ? `
            <p style="color: #4b5563; margin: 8px 0; font-size: 14px; line-height: 1.5;">
              ${item.description.length > 150 ? item.description.substring(0, 147) + '...' : item.description}
            </p>
          ` : ''}
          <div style="margin-top: 16px;">
            <a 
              href="${getDialogUrl(contentType, item.id, siteUrl)}" 
              style="display: inline-block; background-color: ${styles.accent}; color: white; 
                    padding: 8px 16px; text-decoration: none; border-radius: 6px; 
                    font-size: 14px; font-weight: 500;"
            >
              Learn More
            </a>
          </div>
        </div>
      </div>
    `;
  }

  return cardHtml;
}
