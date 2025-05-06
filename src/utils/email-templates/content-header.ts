
/**
 * Generates a content-specific header for email templates
 */
export function generateContentHeader(
  contentType: string, 
  totalAmount: string | undefined, 
  recipientName: string,
  styles: { primary: string; secondary: string; accent: string }
): string {
  let greeting = recipientName ? `Hello ${recipientName},` : 'Hello,';
  let headerText = '';
  let subheaderText = '';

  switch (contentType) {
    case 'scholarships':
      headerText = 'Scholarship Opportunities';
      subheaderText = totalAmount 
        ? `Discover scholarships worth up to ${totalAmount} that match your profile!` 
        : 'Discover these scholarship opportunities that match your profile!';
      break;
    case 'opportunities':
      headerText = 'Career Opportunities';
      subheaderText = 'Explore these exclusive opportunities selected just for you.';
      break;
    case 'careers':
      headerText = 'Career Pathways';
      subheaderText = 'Discover these career paths that align with your skills and interests.';
      break;
    case 'majors':
      headerText = 'Academic Programs';
      subheaderText = 'Explore these academic majors that could be perfect for your career goals.';
      break;
    case 'schools':
      headerText = 'Educational Institutions';
      subheaderText = 'Check out these schools that match your educational preferences.';
      break;
    case 'mentors':
      headerText = 'Meet Your Mentors';
      subheaderText = 'Connect with these exceptional mentors selected based on your interests.';
      break;
    case 'blogs':
      headerText = 'Latest Insights';
      subheaderText = 'Read the latest articles and insights from our platform.';
      break;
    case 'events':
      headerText = 'Upcoming Events';
      subheaderText = 'Don\'t miss these upcoming events that match your interests.';
      break;
    default:
      headerText = 'Personalized Content';
      subheaderText = 'Check out this content selected just for you.';
  }

  return `
    <div style="padding: 24px; text-align: center;">
      <h1 style="margin: 0 0 16px 0; color: ${styles.primary}; font-size: 24px; font-weight: 600;">
        ${headerText}
      </h1>
      
      <p style="margin: 0 0 24px 0; color: #4b5563; font-size: 16px;">
        ${greeting} ${subheaderText}
      </p>
    </div>
  `;
}
