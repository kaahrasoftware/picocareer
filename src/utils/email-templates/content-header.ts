
import { renderScholarshipHeader } from "./scholarship-renderer";
import type { ContentItem } from "@/types/database/email";

export function generateContentHeader(
  contentType: string,
  totalAmount?: string,
  recipientName?: string,
  styles?: { primary: string; secondary: string; accent: string },
  contentItems?: ContentItem[]
): string {
  const defaultStyles = {
    primary: "#4f46e5",
    secondary: "#3730a3",
    accent: "#4f46e5"
  };
  
  const headerStyles = styles || defaultStyles;

  // Use special scholarship header for scholarships
  if (contentType === 'scholarships' && contentItems) {
    return renderScholarshipHeader(contentItems, recipientName || '', headerStyles);
  }

  // Default header for other content types
  const contentTypeLabels: Record<string, { title: string; icon: string }> = {
    opportunities: { title: "Career Opportunities", icon: "🚀" },
    careers: { title: "Career Spotlight", icon: "💼" },
    majors: { title: "Academic Programs", icon: "📚" },
    schools: { title: "Educational Institutions", icon: "🏛️" },
    mentors: { title: "Meet Your Mentors", icon: "👋" },
    blogs: { title: "Latest Insights", icon: "📖" },
    events: { title: "Upcoming Events", icon: "🗓️" },
  };

  const contentInfo = contentTypeLabels[contentType] || { title: "Content Update", icon: "📄" };

  return `
    <div style="
      background: linear-gradient(135deg, ${headerStyles.primary}, ${headerStyles.secondary});
      color: white;
      padding: 32px 24px;
      text-align: center;
      margin-bottom: 32px;
    ">
      <div style="font-size: 48px; margin-bottom: 8px;">
        ${contentInfo.icon}
      </div>
      <h1 style="margin: 0 0 8px 0; font-size: 28px; font-weight: 700;">
        ${contentInfo.title}
      </h1>
      ${recipientName ? `
        <p style="margin: 0; font-size: 16px; opacity: 0.8;">
          Hello ${recipientName}!
        </p>
      ` : ''}
    </div>
  `;
}
