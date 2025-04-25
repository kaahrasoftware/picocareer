
import { getContentTypeStyles } from "./styles";

export function generateContentHeader(
  contentType: string,
  totalAmount?: string,
  recipientName?: string
) {
  const styles = getContentTypeStyles(contentType);
  const greeting = recipientName ? `Hi ${recipientName.split(' ')[0]},` : 'Hi there,';

  return `
    <div style="${styles.gradient}; color: white; padding: 32px; border-radius: 16px; margin-bottom: 32px; text-align: center;">
      <div style="font-size: 48px; margin-bottom: 16px;">${styles.icon}</div>
      <h1 style="margin: 0 0 16px 0; font-size: 32px; font-weight: 700;">
        ${getContentTypeHeading(contentType)}
      </h1>
      ${totalAmount ? `
        <p style="margin: 16px 0 0 0; font-size: 20px; font-weight: 500;">
          Total Value: ${totalAmount}
        </p>
      ` : ''}
    </div>
    <div style="margin-bottom: 32px;">
      <p style="font-size: 18px; line-height: 1.6; color: #374151; margin: 0;">
        ${greeting}
      </p>
      <p style="font-size: 16px; line-height: 1.6; color: #374151; margin-top: 16px;">
        ${getContentTypeIntro(contentType)}
      </p>
    </div>
  `;
}

function getContentTypeHeading(contentType: string): string {
  switch (contentType) {
    case 'scholarships':
      return 'Exclusive Scholarship Opportunities';
    case 'opportunities':
      return 'Career Opportunities Selected for You';
    case 'careers':
      return 'Promising Career Paths';
    case 'majors':
      return 'Academic Paths for Your Future';
    case 'schools':
      return 'Top Educational Institutions';
    case 'mentors':
      return 'Meet Your Potential Mentors';
    case 'blogs':
      return 'Fresh Career Insights';
    default:
      return 'Personalized Recommendations';
  }
}

function getContentTypeIntro(contentType: string): string {
  switch (contentType) {
    case 'scholarships':
      return "We've found some exciting scholarship opportunities that match your profile. These opportunities could help fund your education and bring you closer to achieving your academic goals.";
    case 'opportunities':
      return "We've curated these career opportunities based on your interests and skills. These positions could be your next career milestone.";
    case 'careers':
      return "Based on your profile and interests, we've identified these career paths that might interest you. Each one offers unique opportunities for growth and success.";
    case 'majors':
      return "Discover these academic majors that align with your interests and career goals. Each program offers unique opportunities for learning and future career prospects.";
    case 'schools':
      return "We've selected these educational institutions based on your preferences and academic interests. Each one offers unique opportunities for growth and learning.";
    case 'mentors':
      return "Connect with experienced professionals who can guide you on your career journey. These mentors have valuable insights to share in your areas of interest.";
    case 'blogs':
      return "Stay informed with these latest insights and tips relevant to your career interests. These articles provide valuable perspectives and practical advice.";
    default:
      return "We've curated this content specially for you based on your interests and preferences.";
  }
}
