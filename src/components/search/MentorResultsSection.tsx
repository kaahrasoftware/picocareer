import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import type { SearchResult } from "@/hooks/useSearchData";

interface MentorResultsSectionProps {
  mentors: SearchResult[];
  onSelectMentor: (id: string) => void;
}

export const MentorResultsSection = ({ mentors, onSelectMentor }: MentorResultsSectionProps) => {
  if (!mentors.length) return null;

  const shouldUseGrid = mentors.length > 4;

  return (
    <div className="px-4">
      <h3 className="text-lg font-semibold mb-3 text-foreground">Mentors</h3>
      <div className="w-full">
        <div className={`${shouldUseGrid 
          ? 'grid grid-cols-3 gap-4 place-items-center' 
          : 'flex gap-4 justify-center'}`}
        >
          {mentors.map((mentor) => (
            <Card 
              key={mentor.id}
              className="flex-shrink-0 flex flex-col p-4 w-[250px] hover:bg-accent/50 transition-colors cursor-pointer"
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
              <Badge variant="secondary" className="self-start">
                Mentor
              </Badge>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};