
import { ContentItem } from "@/types/database/email";

/**
 * Renders a modern scholarship card for email templates
 */
export function renderScholarshipCard(
  scholarship: ContentItem,
  siteUrl: string,
  styles: { primary: string; secondary: string; accent: string }
): string {
  const title = scholarship.title || 'Untitled Scholarship';
  const description = scholarship.description || '';
  const amount = scholarship.amount || 0;
  const providerName = scholarship.provider_name || '';
  const deadline = scholarship.deadline;
  
  // Truncate description to 150 characters
  const shortDescription = description.length > 150 
    ? description.substring(0, 150) + '...' 
    : description;

  // Format amount with proper currency formatting
  const formattedAmount = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount);

  // Calculate deadline urgency
  const deadlineInfo = getDeadlineInfo(deadline);
  
  // Direct link to scholarship dialog
  const scholarshipUrl = `${siteUrl}/scholarships?dialog=${scholarship.id}`;

  return `
    <div style="
      background: white;
      border-radius: 12px;
      padding: 0;
      margin-bottom: 24px;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
      overflow: hidden;
      position: relative;
      border: 1px solid #e5e7eb;
    ">
      <!-- Amount Badge -->
      <div style="
        position: absolute;
        top: 16px;
        right: 16px;
        background: ${styles.accent};
        color: white;
        padding: 8px 16px;
        border-radius: 20px;
        font-weight: bold;
        font-size: 18px;
        z-index: 2;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
      ">
        ${formattedAmount}
      </div>

      <!-- Content Area -->
      <div style="padding: 24px; padding-right: 140px;">
        <!-- Title and Provider -->
        <div style="margin-bottom: 12px;">
          <h3 style="
            margin: 0 0 4px 0;
            font-size: 20px;
            font-weight: 600;
            color: #1f2937;
            line-height: 1.3;
          ">
            ${title}
          </h3>
          ${providerName ? `
            <p style="
              margin: 0;
              font-size: 14px;
              color: #6b7280;
              font-weight: 500;
            ">
              by ${providerName}
            </p>
          ` : ''}
        </div>

        <!-- Description -->
        ${shortDescription ? `
          <p style="
            margin: 0 0 16px 0;
            font-size: 15px;
            color: #4b5563;
            line-height: 1.5;
          ">
            ${shortDescription}
          </p>
        ` : ''}

        <!-- Deadline Info -->
        ${deadlineInfo.text ? `
          <div style="
            display: inline-block;
            background: ${deadlineInfo.bgColor};
            color: ${deadlineInfo.textColor};
            padding: 6px 12px;
            border-radius: 6px;
            font-size: 13px;
            font-weight: 500;
            margin-bottom: 20px;
          ">
            ${deadlineInfo.icon} ${deadlineInfo.text}
          </div>
        ` : ''}

        <!-- CTA Button -->
        <div style="margin-top: 20px;">
          <a href="${scholarshipUrl}" style="
            display: inline-block;
            background: linear-gradient(135deg, ${styles.primary}, ${styles.secondary});
            color: white;
            padding: 12px 24px;
            border-radius: 8px;
            text-decoration: none;
            font-weight: 600;
            font-size: 16px;
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
            transition: all 0.2s ease;
          ">
            Apply Now →
          </a>
        </div>
      </div>
    </div>
  `;
}

/**
 * Generates scholarship email header with total amount
 */
export function renderScholarshipHeader(
  scholarships: ContentItem[],
  recipientName: string,
  styles: { primary: string; secondary: string; accent: string }
): string {
  const totalAmount = scholarships.reduce((sum, scholarship) => {
    return sum + (scholarship.amount || 0);
  }, 0);

  const formattedTotal = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(totalAmount);

  const scholarshipCount = scholarships.length;
  const scholarshipText = scholarshipCount === 1 ? 'scholarship' : 'scholarships';

  return `
    <div style="
      background: linear-gradient(135deg, ${styles.primary}, ${styles.secondary});
      color: white;
      padding: 32px 24px;
      text-align: center;
      margin-bottom: 32px;
    ">
      <div style="
        font-size: 48px;
        margin-bottom: 8px;
      ">
        🎓
      </div>
      <h1 style="
        margin: 0 0 8px 0;
        font-size: 28px;
        font-weight: 700;
      ">
        Scholarship Opportunities
      </h1>
      <p style="
        margin: 0 0 16px 0;
        font-size: 18px;
        opacity: 0.9;
      ">
        ${scholarshipCount} ${scholarshipText} worth ${formattedTotal} selected for you
      </p>
      ${recipientName ? `
        <p style="
          margin: 0;
          font-size: 16px;
          opacity: 0.8;
        ">
          Hello ${recipientName}!
        </p>
      ` : ''}
    </div>
  `;
}

/**
 * Helper function to get deadline information with urgency styling
 */
function getDeadlineInfo(deadline?: string): {
  text: string;
  bgColor: string;
  textColor: string;
  icon: string;
} {
  if (!deadline) {
    return {
      text: '',
      bgColor: '',
      textColor: '',
      icon: ''
    };
  }

  const deadlineDate = new Date(deadline);
  const now = new Date();
  const daysUntilDeadline = Math.ceil((deadlineDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

  const formattedDate = deadlineDate.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });

  if (daysUntilDeadline < 0) {
    return {
      text: `Deadline passed (${formattedDate})`,
      bgColor: '#fee2e2',
      textColor: '#dc2626',
      icon: '⚠️'
    };
  } else if (daysUntilDeadline <= 7) {
    return {
      text: `Deadline: ${formattedDate} (${daysUntilDeadline} days left)`,
      bgColor: '#fee2e2',
      textColor: '#dc2626',
      icon: '🚨'
    };
  } else if (daysUntilDeadline <= 30) {
    return {
      text: `Deadline: ${formattedDate} (${daysUntilDeadline} days left)`,
      bgColor: '#fef3c7',
      textColor: '#d97706',
      icon: '⏰'
    };
  } else {
    return {
      text: `Deadline: ${formattedDate}`,
      bgColor: '#f0f9ff',
      textColor: '#0369a1',
      icon: '📅'
    };
  }
}
