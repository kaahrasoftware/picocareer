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
  company?: { name: string } | null;
  career?: { title: string } | null;
  location?: string;
}

interface MentorSearchResultsProps {
  results: SearchResult[];
}

export const MentorSearchResults = ({ results }: MentorSearchResultsProps) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { session } = useProfileSession();
  const [selectedMentorId, setSelectedMentorId] = useState<string | null>(null);

  const handleMentorClick = (mentorId: string) => {
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
    setSelectedMentorId(mentorId);
  };

  const handleResultClick = (result: SearchResult) => {
    if (result.type === 'mentor') {
      handleMentorClick(result.id);
    } else if (result.type === 'career') {
      navigate(`/career/${result.id}`);
    } else if (result.type === 'major') {
      navigate(`/program/${result.id}`);
    }
  };

  const mentors = results.filter(result => result.type === 'mentor');
  const careers = results.filter(result => result.type === 'career');
  const majors = results.filter(result => result.type === 'major');

  return (
    <div className="space-y-6">
      {mentors.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-4">
            <Award className="h-5 w-5 text-primary" />
            <h3 className="text-lg font-semibold">Mentors</h3>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            {mentors.map((mentor) => (
              <div
                key={mentor.id}
                onClick={() => handleResultClick(mentor)}
                className="p-4 rounded-lg border border-border hover:border-primary/50 cursor-pointer transition-colors"
              >
                <h4 className="font-medium mb-2">{mentor.title}</h4>
                {mentor.company && (
                  <p className="text-sm text-muted-foreground mb-2">
                    {mentor.company.name}
                  </p>
                )}
                {mentor.location && (
                  <p className="text-sm text-muted-foreground">
                    {mentor.location}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {careers.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-4">
            <Briefcase className="h-5 w-5 text-primary" />
            <h3 className="text-lg font-semibold">Careers</h3>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            {careers.map((career) => (
              <div
                key={career.id}
                onClick={() => handleResultClick(career)}
                className="p-4 rounded-lg border border-border hover:border-primary/50 cursor-pointer transition-colors"
              >
                <h4 className="font-medium mb-2">{career.title}</h4>
                {career.description && (
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {career.description}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {majors.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-4">
            <GraduationCap className="h-5 w-5 text-primary" />
            <h3 className="text-lg font-semibold">Fields of Study</h3>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            {majors.map((major) => (
              <div
                key={major.id}
                onClick={() => handleResultClick(major)}
                className="p-4 rounded-lg border border-border hover:border-primary/50 cursor-pointer transition-colors"
              >
                <h4 className="font-medium mb-2">{major.title}</h4>
                {major.description && (
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {major.description}
                  </p>
                )}
              </div>
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