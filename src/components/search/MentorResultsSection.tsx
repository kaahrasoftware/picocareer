import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import type { SearchResult } from "@/types/search";
import { isMentorResult } from "@/types/search";
import { useState } from "react";
import { BlogPagination } from "@/components/blog/BlogPagination";
import { Award } from "lucide-react";
import { LoadMoreButton } from "@/components/community/LoadMoreButton";

interface MentorResultsSectionProps {
  mentors: SearchResult[];
  onSelectMentor: (id: string) => void;
}

export const MentorResultsSection = ({ mentors, onSelectMentor }: MentorResultsSectionProps) => {
  const [displayCount, setDisplayCount] = useState(6);
  const validMentors = mentors.filter(isMentorResult);
  
  if (!validMentors.length) return null;

  const displayedMentors = validMentors.slice(0, displayCount);
  const hasMore = displayCount < validMentors.length;

  const handleLoadMore = () => {
    setDisplayCount(prev => Math.min(prev + 6, validMentors.length));
  };

  return (
    <div className="px-4">
      <h3 className="text-lg font-semibold mb-3 text-foreground">
        Mentors ({validMentors.length} results)
      </h3>
      <div className="w-full">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 place-items-center">
          {displayedMentors.map((mentor) => (
            <Card 
              key={mentor.id}
              className="flex-shrink-0 flex flex-col p-4 w-full max-w-[250px] hover:bg-accent/50 transition-colors cursor-pointer"
              onClick={() => onSelectMentor(mentor.id)}
            >
              <div className="flex items-center gap-3 mb-3">
                <Avatar className="h-10 w-10">
                  <AvatarImage src={mentor.avatar_url} alt={mentor.title} />
                  <AvatarFallback>{mentor.title[0]}</AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <h4 className="font-medium text-sm truncate">{mentor.title}</h4>
                  <p className="text-xs text-muted-foreground truncate">
                    {mentor.description}
                  </p>
                </div>
              </div>
              <div className="flex gap-2">
                {mentor.top_mentor ? (
                  <Badge className="bg-gradient-to-r from-primary/80 to-primary text-white hover:from-primary hover:to-primary/90 flex items-center gap-1">
                    <Award className="h-3 w-3" />
                    Top Mentor
                  </Badge>
                ) : (
                  <Badge variant="secondary">
                    Mentor
                  </Badge>
                )}
              </div>
            </Card>
          ))}
        </div>
        
        {hasMore && (
          <div className="flex justify-center mt-6">
            <LoadMoreButton 
              hasMore={hasMore}
              isLoading={false}
              onClick={handleLoadMore}
            />
          </div>
        )}
      </div>
    </div>
  );
};