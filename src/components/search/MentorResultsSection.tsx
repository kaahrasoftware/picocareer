import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import type { SearchResult } from "@/types/search";
import { isMentorResult } from "@/types/search";
import { useState } from "react";
import { BlogPagination } from "@/components/blog/BlogPagination";
import { Award, Building2, MapPin } from "lucide-react";

interface MentorResultsSectionProps {
  mentors: SearchResult[];
  onSelectMentor: (id: string) => void;
}

export const MentorResultsSection = ({ mentors, onSelectMentor }: MentorResultsSectionProps) => {
  const [currentPage, setCurrentPage] = useState(1);
  const MENTORS_PER_PAGE = 6;
  const validMentors = mentors.filter(isMentorResult);
  
  if (!validMentors.length) return null;

  const totalPages = Math.ceil(validMentors.length / MENTORS_PER_PAGE);
  const startIndex = (currentPage - 1) * MENTORS_PER_PAGE;
  const paginatedMentors = validMentors.slice(startIndex, startIndex + MENTORS_PER_PAGE);

  return (
    <div className="px-4">
      <h3 className="text-lg font-semibold mb-3 text-foreground">
        Mentors ({validMentors.length} results)
      </h3>
      <div className="w-full">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {paginatedMentors.map((mentor) => (
            <Card 
              key={mentor.id}
              className="group relative overflow-hidden flex flex-col p-6 hover:shadow-lg transition-all duration-200 cursor-pointer bg-card hover:bg-accent/5"
              onClick={() => onSelectMentor(mentor.id)}
            >
              <div className="flex items-start gap-4 mb-4">
                <Avatar className="h-12 w-12 ring-2 ring-background">
                  <AvatarImage src={mentor.avatar_url} alt={mentor.title} />
                  <AvatarFallback className="bg-primary/10 text-primary">
                    {mentor.title[0]}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0 space-y-1">
                  <h4 className="font-medium text-base truncate">{mentor.title}</h4>
                  <div className="flex flex-col gap-1">
                    {mentor.position && (
                      <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                        <Building2 className="h-3.5 w-3.5 flex-shrink-0" />
                        <span className="truncate">{mentor.position}</span>
                      </div>
                    )}
                    {mentor.location && (
                      <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                        <MapPin className="h-3.5 w-3.5 flex-shrink-0" />
                        <span className="truncate">{mentor.location}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
              <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
                {mentor.description}
              </p>
              <div className="mt-auto flex flex-wrap gap-2">
                {mentor.top_mentor ? (
                  <Badge className="bg-gradient-to-r from-primary/80 to-primary text-primary-foreground hover:from-primary hover:to-primary/90 transition-colors flex items-center gap-1">
                    <Award className="h-3 w-3" />
                    Top Mentor
                  </Badge>
                ) : (
                  <Badge variant="secondary" className="bg-secondary/10 text-secondary hover:bg-secondary/20">
                    Mentor
                  </Badge>
                )}
              </div>
            </Card>
          ))}
        </div>
        
        {totalPages > 1 && (
          <div className="mt-6">
            <BlogPagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
            />
          </div>
        )}
      </div>
    </div>
  );
};