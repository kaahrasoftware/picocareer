import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Award } from "lucide-react";
import type { SearchResult } from "@/types/search";
import { useState } from "react";
import { BookSessionDialog } from "@/components/BookSessionDialog";

interface MentorResultsSectionProps {
  mentors: SearchResult[];
  onClose: () => void;
}

export const MentorResultsSection = ({ mentors, onClose }: MentorResultsSectionProps) => {
  const [selectedMentorId, setSelectedMentorId] = useState<string | null>(null);
  const validMentors = mentors.filter((mentor) => mentor.type === "mentor");
  
  if (!validMentors.length) return null;

  return (
    <div className="px-4">
      <h3 className="text-lg font-semibold mb-3 text-foreground">
        Mentors ({validMentors.length} results)
      </h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 place-items-center">
        {validMentors.map((mentor) => (
          <Card 
            key={mentor.id}
            className="flex-shrink-0 flex flex-col p-4 w-full max-w-[250px] hover:bg-accent/50 transition-colors"
          >
            <div className="flex items-center gap-3 mb-3">
              <Avatar className="h-10 w-10">
                <AvatarImage src={mentor.avatar_url || ''} alt={mentor.title} />
                <AvatarFallback>{mentor.title[0]}</AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <h4 className="font-medium text-sm truncate">{mentor.title}</h4>
                <p className="text-xs text-muted-foreground truncate">
                  {mentor.description}
                </p>
              </div>
            </div>
            <div className="flex flex-col gap-2">
              {mentor.top_mentor ? (
                <Badge className="bg-gradient-to-r from-primary/80 to-primary text-white hover:from-primary hover:to-primary/90 flex items-center gap-1 w-fit">
                  <Award className="h-3 w-3" />
                  Top Mentor
                </Badge>
              ) : (
                <Badge variant="secondary" className="w-fit">
                  Mentor
                </Badge>
              )}
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setSelectedMentorId(mentor.id)}
              >
                Book Session
              </Button>
            </div>
          </Card>
        ))}
      </div>

      {selectedMentorId && (
        <BookSessionDialog
          mentor={{
            id: selectedMentorId,
            name: validMentors.find(m => m.id === selectedMentorId)?.title || '',
            imageUrl: validMentors.find(m => m.id === selectedMentorId)?.avatar_url || ''
          }}
          open={!!selectedMentorId}
          onOpenChange={(open) => !open && setSelectedMentorId(null)}
        />
      )}
    </div>
  );
};