
export type ContentType = 'blogs' | 'event' | 'news' | 'update' | 'promotion' | 'scholarships' | 'opportunities' | 'careers' | 'majors' | 'schools' | 'mentors';

export const CONTENT_TYPE_LABELS: Record<ContentType, string> = {
  blogs: 'Blog Posts',
  event: 'Events',
  news: 'News',
  update: 'Updates',
  promotion: 'Promotions',
  scholarships: 'Scholarships',
  opportunities: 'Opportunities',
  careers: 'Career Paths',
  majors: 'Academic Majors',
  schools: 'Schools/Institutions',
  mentors: 'Mentors'
};

// Function to generate email content based on content type and data
export const generateEmailPreview = (contentType: ContentType, contentItems: any[]) => {
  // This would be a placeholder for a more sophisticated email preview generator
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="background-color: #f3f4f6; padding: 20px; text-align: center;">
        <h1>${CONTENT_TYPE_LABELS[contentType]}</h1>
      </div>
      <div style="padding: 20px;">
        ${contentItems.map(item => `
          <div style="margin-bottom: 20px; padding-bottom: 20px; border-bottom: 1px solid #e5e7eb;">
            <h2>${item.title}</h2>
            <p>${item.description || 'No description available'}</p>
            <a href="#" style="color: #4f46e5; text-decoration: none;">View Details</a>
          </div>
        `).join('')}
      </div>
      <div style="background-color: #f3f4f6; padding: 20px; text-align: center; font-size: 12px; color: #6b7280;">
        <p>You're receiving this email because you subscribed to our newsletter.</p>
        <p>To unsubscribe, <a href="#" style="color: #4f46e5;">click here</a>.</p>
      </div>
    </div>
  `;
};
