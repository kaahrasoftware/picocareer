
import { Badge } from "@/components/ui/badge";

interface ContentTypeBadgeProps {
  contentType: string;
}

export function ContentTypeBadge({ contentType }: ContentTypeBadgeProps) {
  const getIcon = (type: string) => {
    switch (type) {
      case 'scholarships': return '🎓';
      case 'opportunities': return '🚀';
      case 'careers': return '💼';
      case 'majors': return '📚';
      case 'schools': return '🏛️';
      case 'mentors': return '👨‍🏫';
      case 'blogs': return '📖';
      case 'events': return '🗓️';
      default: return '📄';
    }
  };

  switch (contentType) {
    case 'scholarships':
      return (
        <Badge variant="outline" className="bg-purple-50/80 text-purple-700 border-purple-200/60 font-medium">
          {getIcon(contentType)} Scholarship
        </Badge>
      );
    case 'opportunities':
      return (
        <Badge variant="outline" className="bg-blue-50/80 text-blue-700 border-blue-200/60 font-medium">
          {getIcon(contentType)} Opportunity
        </Badge>
      );
    case 'careers':
      return (
        <Badge variant="outline" className="bg-teal-50/80 text-teal-700 border-teal-200/60 font-medium">
          {getIcon(contentType)} Career
        </Badge>
      );
    case 'majors':
      return (
        <Badge variant="outline" className="bg-indigo-50/80 text-indigo-700 border-indigo-200/60 font-medium">
          {getIcon(contentType)} Major
        </Badge>
      );
    case 'schools':
      return (
        <Badge variant="outline" className="bg-sky-50/80 text-sky-700 border-sky-200/60 font-medium">
          {getIcon(contentType)} School
        </Badge>
      );
    case 'mentors':
      return (
        <Badge variant="outline" className="bg-amber-50/80 text-amber-700 border-amber-200/60 font-medium">
          {getIcon(contentType)} Mentor
        </Badge>
      );
    case 'blogs':
      return (
        <Badge variant="outline" className="bg-rose-50/80 text-rose-700 border-rose-200/60 font-medium">
          {getIcon(contentType)} Blog
        </Badge>
      );
    default:
      return (
        <Badge variant="outline" className="bg-gray-50/80 text-gray-700 border-gray-200/60 font-medium">
          {getIcon(contentType)} {contentType}
        </Badge>
      );
  }
}
