import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Award, Briefcase, GraduationCap } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { ProfileDetailsDialog } from "@/components/ProfileDetailsDialog";
import { useState } from "react";
import { useProfileSession } from "@/hooks/useProfileSession";

interface SearchResult {
  id: string;
  type: 'mentor' | 'career' | 'major';
  title: string;
  description?: string;
  avatar_url?: string;
  top_mentor?: boolean;
  salary_range?: string;
  degree_levels?: string[];
}

interface MentorSearchResultsProps {
  results: SearchResult[];
}

export const MentorSearchResults = ({ results }: MentorSearchResultsProps) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { session } = useProfileSession();
  const [selectedMentorId, setSelectedMentorId] = useState<string | null>(null);

  const handleResultClick = (result: SearchResult) => {
    if (result.type === 'mentor') {
      if (!session) {
        toast({
          title: "Authentication Required",
          description: "Please sign in to view mentor profiles",
          variant: "default",
          action: (
            <Button 
              onClick={() => navigate("/auth")}
              variant="default" 
              className="bg-green-500 text-white hover:bg-green-600"
            >
              Sign In
            </Button>
          ),
        });
        return;
      }
      setSelectedMentorId(result.id);
    } else if (result.type === 'career') {
      navigate(`/career/${result.id}`);
    } else if (result.type === 'major') {
      navigate(`/program/${result.id}`);
    }
  };

  const groupedResults = {
    mentors: results.filter(r => r.type === 'mentor'),
    careers: results.filter(r => r.type === 'career'),
    majors: results.filter(r => r.type === 'major')
  };

  return (
    <div className="space-y-6">
      {/* Mentors Section */}
      {groupedResults.mentors.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold mb-3">Mentors</h3>
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            {groupedResults.mentors.map((result) => (
              <Card
                key={result.id}
                className="flex items-center p-4 cursor-pointer hover:bg-accent/50 transition-colors"
                onClick={() => handleResultClick(result)}
              >
                <Avatar className="h-10 w-10 mr-3">
                  <AvatarImage src={result.avatar_url} alt={result.title} />
                  <AvatarFallback>{result.title[0]}</AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-medium truncate">{result.title}</p>
                    {result.top_mentor && (
                      <Badge className="bg-primary/80">
                        <Award className="h-3 w-3 mr-1" />
                        Top Mentor
                      </Badge>
                    )}
                  </div>
                  {result.description && (
                    <p className="text-sm text-muted-foreground truncate">
                      {result.description}
                    </p>
                  )}
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Careers Section */}
      {groupedResults.careers.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold mb-3">Careers</h3>
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            {groupedResults.careers.map((result) => (
              <Card
                key={result.id}
                className="flex items-center p-4 cursor-pointer hover:bg-accent/50 transition-colors"
                onClick={() => handleResultClick(result)}
              >
                <div className="mr-3">
                  <Briefcase className="h-10 w-10 text-muted-foreground" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate">{result.title}</p>
                  {result.salary_range && (
                    <Badge variant="secondary">
                      {result.salary_range}
                    </Badge>
                  )}
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Majors Section */}
      {groupedResults.majors.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold mb-3">Fields of Study</h3>
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            {groupedResults.majors.map((result) => (
              <Card
                key={result.id}
                className="flex items-center p-4 cursor-pointer hover:bg-accent/50 transition-colors"
                onClick={() => handleResultClick(result)}
              >
                <div className="mr-3">
                  <GraduationCap className="h-10 w-10 text-muted-foreground" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate">{result.title}</p>
                  {result.degree_levels && result.degree_levels.length > 0 && (
                    <Badge variant="secondary">
                      {result.degree_levels.join(', ')}
                    </Badge>
                  )}
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {selectedMentorId && (
        <ProfileDetailsDialog
          userId={selectedMentorId}
          open={!!selectedMentorId}
          onOpenChange={(open) => !open && setSelectedMentorId(null)}
        />
      )}
    </div>
  );
};