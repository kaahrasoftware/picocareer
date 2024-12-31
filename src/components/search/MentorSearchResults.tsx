import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Building2, MapPin, GraduationCap } from "lucide-react";

interface MentorSearchResult {
  id: string;
  first_name: string;
  last_name: string;
  avatar_url: string;
  position: string;
  location: string;
  career: { title: string } | null;
  company: { name: string } | null;
  academic_major: { title: string } | null;
  school: { name: string } | null;
}

interface MentorSearchResultsProps {
  results: MentorSearchResult[];
}

export const MentorSearchResults = ({ results }: MentorSearchResultsProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {results.map((mentor) => (
        <Card key={mentor.id} className="p-4 hover:bg-accent/50 transition-colors">
          <div className="flex items-start gap-4">
            <Avatar className="h-12 w-12">
              <AvatarImage src={mentor.avatar_url} alt={`${mentor.first_name} ${mentor.last_name}`} />
              <AvatarFallback>
                {mentor.first_name?.[0]}
                {mentor.last_name?.[0]}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <h4 className="font-medium text-sm">
                {mentor.first_name} {mentor.last_name}
              </h4>
              {(mentor.career?.title || mentor.company?.name) && (
                <div className="flex items-center gap-1 text-sm text-muted-foreground mt-1">
                  <Building2 className="h-3 w-3 flex-shrink-0" />
                  <span className="truncate">
                    {mentor.career?.title}
                    {mentor.career?.title && mentor.company?.name && " at "}
                    {mentor.company?.name}
                  </span>
                </div>
              )}
              {(mentor.academic_major?.title || mentor.school?.name) && (
                <div className="flex items-center gap-1 text-sm text-muted-foreground mt-1">
                  <GraduationCap className="h-3 w-3 flex-shrink-0" />
                  <span className="truncate">
                    {mentor.academic_major?.title}
                    {mentor.academic_major?.title && mentor.school?.name && " at "}
                    {mentor.school?.name}
                  </span>
                </div>
              )}
              {mentor.location && (
                <div className="flex items-center gap-1 text-sm text-muted-foreground mt-1">
                  <MapPin className="h-3 w-3 flex-shrink-0" />
                  <span className="truncate">{mentor.location}</span>
                </div>
              )}
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
};