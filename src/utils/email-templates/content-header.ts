import { getContentTypeStyles } from "./styles";

export function generateContentHeader(
  contentType: string,
  totalAmount?: string,
  recipientName?: string
) {
  const styles = getContentTypeStyles(contentType);
  const greeting = recipientName ? `Hi ${recipientName.split(' ')[0]},` : 'Hi there,';
  const contentLabel = contentType.charAt(0).toUpperCase() + contentType.slice(1);

  return `
    <div style="margin-bottom: 32px;">
      <h1 style="margin: 0 0 24px 0; font-size: 24px; font-weight: 600; color: ${styles.accent}; text-align: center;">
        ${contentLabel} Spotlight
      </h1>
      
      <p style="font-size: 16px; line-height: 1.6; color: #374151; margin: 0;">
        ${greeting}
      </p>
      <p style="font-size: 16px; line-height: 1.6; color: #374151; margin-top: 16px;">
        ${getContentTypeIntro(contentType)}
      </p>
    </div>
  `;
}

function getContentTypeIntro(contentType: string): string {
  switch (contentType) {
    case 'scholarships':
      return "We've curated some exciting scholarship opportunities that match your profile. Take a look at these opportunities to help fund your education journey.";
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
