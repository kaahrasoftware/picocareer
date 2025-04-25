
import { ContentItem } from "./types.ts";
import { getContentTypeStyles } from "./styles.ts";

function calculateTotalAmount(contentItems: ContentItem[]): string {
  const total = contentItems.reduce((sum, item) => {
    return sum + (item.amount || 0);
  }, 0);
  
  return new Intl.NumberFormat('en-US', { 
    style: 'currency', 
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(total);
}

export function getEmailSubject(contentType: string, recipientFirstName: string = ''): string {
  const greeting = recipientFirstName ? `${recipientFirstName}, check out` : 'Check out';
  
  switch(contentType) {
    case 'scholarships':
      return `${greeting} these scholarship opportunities`;
    case 'opportunities':
      return `${greeting} these career opportunities`;
    case 'careers':
      return `${greeting} these promising career paths`;
    case 'majors':
      return `${greeting} these academic majors that align with your interests`;
    case 'schools':
      return `${greeting} these recommended schools`;
    case 'mentors':
      return `${greeting} these mentors who can help guide your career journey`;
    case 'blogs':
      return `${greeting} these insightful career articles`;
    default:
      return `PicoCareer Newsletter: Personalized opportunities for you`;
  }
}

export function generateEmailContent(
  subject: string,
  introduction: string,
  recipientName: string,
  campaignId: string,
  contentItems: ContentItem[],
  contentType: string,
  siteUrl: string
): string {
  const personalizedIntro = recipientName 
    ? `Hi ${recipientName.split(' ')[0]},` 
    : 'Hi there,';
  
  const { cardStyles, headerStyles, contentTypeLabel } = getContentTypeStyles(contentType);
  
  const trackingParams = `utm_source=email&utm_medium=campaign&utm_campaign=${campaignId}`;
  const contentCards = contentItems.map(item => generateContentCard(item, contentType, cardStyles, siteUrl, trackingParams)).join('');
  
  const totalAmount = contentType === 'scholarships' 
    ? `<p style="font-size: 18px; font-weight: bold; margin: 20px 0;">Total Available: ${calculateTotalAmount(contentItems)}</p>` 
    : '';
  
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1">
      <title>${subject}</title>
      <style>
        body {
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          line-height: 1.6;
          color: #333;
          margin: 0;
          padding: 0;
          background-color: #f9f9f9;
        }
        .container {
          max-width: 600px;
          margin: 0 auto;
          padding: 20px;
          background-color: #ffffff;
        }
        .header {
          text-align: center;
          padding: 20px 0;
        }
        .content {
          padding: 20px 0;
        }
        .footer {
          text-align: center;
          padding: 20px 0;
          font-size: 12px;
          color: #666;
          border-top: 1px solid #eee;
        }
        .card {
          margin-bottom: 20px;
          border-radius: 8px;
          overflow: hidden;
          box-shadow: 0 4px 6px rgba(0,0,0,0.1);
        }
        .button {
          display: inline-block;
          padding: 10px 20px;
          background-color: #8B5CF6;
          color: white;
          text-decoration: none;
          border-radius: 5px;
          font-weight: bold;
          margin-top: 10px;
        }
        .button:hover {
          background-color: #7C3AED;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <img src="${siteUrl}/logo.png" alt="PicoCareer Logo" style="max-width: 150px;">
          <h2 style="color: #8B5CF6; margin-top: 10px;">${headerStyles.title}</h2>
        </div>
        
        <div class="content">
          <p>${personalizedIntro}</p>
          <p>${introduction}</p>
          
          ${contentCards}
          ${totalAmount}
          
          <p>Want to discover more ${contentTypeLabel}? Visit our platform!</p>
          <div style="text-align: center; margin: 20px 0;">
            <a href="${siteUrl}/${contentType}?${trackingParams}" class="button">Explore More ${contentTypeLabel}</a>
          </div>
        </div>
        
        <div class="footer">
          <p>You're receiving this email because you subscribed to PicoCareer updates.</p>
          <p>&copy; ${new Date().getFullYear()} PicoCareer. All rights reserved.</p>
          <p>
            <a href="${siteUrl}/preferences?${trackingParams}" style="color: #8B5CF6; text-decoration: none;">Manage Preferences</a> | 
            <a href="${siteUrl}/unsubscribe?${trackingParams}" style="color: #8B5CF6; text-decoration: none;">Unsubscribe</a>
          </p>
        </div>
      </div>
    </body>
    </html>
  `;
}

function generateContentCard(
  item: ContentItem, 
  contentType: string, 
  styles: any, 
  siteUrl: string,
  trackingParams: string
): string {
  const imageUrl = item.cover_image_url || item.image_url || `${siteUrl}/placeholder_${contentType}.jpg`;
  const title = item.title || '';
  const description = item.description ? (item.description.length > 150 ? item.description.substring(0, 147) + '...' : item.description) : '';
  
  const detailUrl = `${siteUrl}/${contentType.slice(0, -1)}/${item.id}?${trackingParams}`;
  
  let metaInfo = '';
  
  switch(contentType) {
    case 'scholarships':
      metaInfo = `
        <p style="font-weight: bold; margin: 10px 0 5px;">
          ${item.provider_name || 'Scholarship Provider'}
          ${item.amount ? ` • $${Number(item.amount).toLocaleString()}` : ''}
        </p>
        ${item.deadline ? `<p style="color: #e53e3e; margin: 0;">Deadline: ${new Date(item.deadline).toLocaleDateString()}</p>` : ''}
      `;
      break;
      
    case 'opportunities':
      metaInfo = `
        <p style="font-weight: bold; margin: 10px 0 5px;">
          ${item.provider_name || 'Opportunity Provider'}
          ${item.compensation ? ` • ${item.compensation}` : ''}
        </p>
        <p style="color: #718096; margin: 5px 0;">
          ${item.location || 'Location not specified'}
          ${item.remote ? ' • Remote' : ''}
          ${item.deadline ? ` • Deadline: ${new Date(item.deadline).toLocaleDateString()}` : ''}
        </p>
      `;
      break;
      
    case 'careers':
      metaInfo = `
        <p style="font-weight: bold; margin: 10px 0 5px;">
          ${item.salary_range ? `Salary: ${item.salary_range}` : ''}
        </p>
      `;
      break;
      
    case 'majors':
      metaInfo = `
        <p style="font-weight: bold; margin: 10px 0 5px;">
          ${item.potential_salary ? `Potential Salary: ${item.potential_salary}` : ''}
        </p>
        <p style="color: #718096; margin: 5px 0;">
          ${item.job_prospects ? `Job Prospects: ${item.job_prospects}` : ''}
        </p>
      `;
      break;
      
    case 'mentors':
      metaInfo = `
        <p style="font-weight: bold; margin: 10px 0 5px;">
          ${item.career_title ? item.career_title : item.position || 'Mentor'}
          ${item.company_name ? ` at ${item.company_name}` : ''}
        </p>
        <p style="color: #718096; margin: 5px 0;">
          ${Array.isArray(item.skills) && item.skills.length > 0 
            ? `Skills: ${item.skills.slice(0, 3).join(', ')}${item.skills.length > 3 ? '...' : ''}`
            : ''}
        </p>
      `;
      break;
      
    case 'schools':
      metaInfo = `
        <p style="font-weight: bold; margin: 10px 0 5px;">
          ${item.type || 'Education Institution'}
        </p>
        <p style="color: #718096; margin: 5px 0;">
          ${item.location || ''}
        </p>
      `;
      break;
      
    case 'blogs':
      metaInfo = `
        <p style="color: #718096; margin: 10px 0 5px;">
          ${new Date(item.created_at || '').toLocaleDateString()}
        </p>
      `;
      break;
  }
  
  return `
    <div class="card" style="${styles.card}">
      <div style="display: flex; flex-direction: row;">
        <div style="flex: 0 0 120px;">
          <img 
            src="${imageUrl}" 
            alt="${title}" 
            style="width: 120px; height: 120px; object-fit: cover;"
          />
        </div>
        <div style="flex: 1; padding: 15px;">
          <h3 style="margin: 0 0 10px; color: #4A5568;">${title}</h3>
          ${metaInfo}
          <p style="margin: 5px 0 15px; color: #4A5568;">${description}</p>
          <a href="${detailUrl}" style="color: #8B5CF6; font-weight: bold; text-decoration: none;">
            View Details →
          </a>
        </div>
      </div>
    </div>
  `;
}
