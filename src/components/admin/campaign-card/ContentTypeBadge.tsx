
import { Badge } from "@/components/ui/badge";

interface ContentTypeBadgeProps {
  contentType: string;
}

export function ContentTypeBadge({ contentType }: ContentTypeBadgeProps) {
  switch (contentType) {
    case 'scholarships':
      return (
        <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">
          Scholarship
        </Badge>
      );
    case 'opportunities':
      return (
        <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
          Opportunity
        </Badge>
      );
    case 'careers':
      return (
        <Badge variant="outline" className="bg-teal-50 text-teal-700 border-teal-200">
          Career
        </Badge>
      );
    case 'majors':
      return (
        <Badge variant="outline" className="bg-indigo-50 text-indigo-700 border-indigo-200">
          Major
        </Badge>
      );
    case 'schools':
      return (
        <Badge variant="outline" className="bg-sky-50 text-sky-700 border-sky-200">
          School
        </Badge>
      );
    case 'mentors':
      return (
        <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">
          Mentor
        </Badge>
      );
    case 'blogs':
      return (
        <Badge variant="outline" className="bg-rose-50 text-rose-700 border-rose-200">
          Blog
        </Badge>
      );
    default:
      return (
        <Badge variant="outline" className="bg-gray-50 text-gray-700 border-gray-200">
          {contentType}
        </Badge>
      );
  }
}
