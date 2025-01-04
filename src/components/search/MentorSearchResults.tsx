import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { useProfileSession } from "@/hooks/useProfileSession";
import { ProfileDetailsDialog } from "@/components/ProfileDetailsDialog";
import { ProfileAvatar } from "@/components/ui/profile-avatar";
import { Building2 } from "lucide-react";

interface MentorResult {
  id: string;
  full_name: string;
  avatar_url: string | null;
  position: string | null;
  company: {
    name: string | null;
  } | null;
}

interface MentorSearchResultsProps {
  results: MentorResult[];
}

export function MentorSearchResults({ results }: MentorSearchResultsProps) {
  const [selectedMentorId, setSelectedMentorId] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const { session } = useProfileSession();
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleMentorClick = (mentorId: string) => {
    if (!session) {
      toast({
        title: "Authentication Required",
        description: "Join our community to connect with amazing mentors and unlock your career potential!",
        variant: "default",
        className: "bg-green-50 border-green-200",
        action: (
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => navigate("/auth")}
            className="border-green-200 text-green-600 hover:bg-green-50 hover:text-green-700"
          >
            Login
          </Button>
        ),
      });
      return;
    }
    setSelectedMentorId(mentorId);
    setDialogOpen(true);
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {results.map((mentor) => (
        <div
          key={mentor.id}
          onClick={() => handleMentorClick(mentor.id)}
          className="flex flex-col items-center p-4 cursor-pointer hover:bg-accent/50 transition-colors rounded-lg space-y-3"
        >
          <ProfileAvatar
            avatarUrl={mentor.avatar_url}
            fallback={mentor.full_name ? mentor.full_name[0] : "?"}
            size="lg"
            editable={false}
          />
          <div className="text-center space-y-1">
            <h3 className="font-medium">{mentor.full_name}</h3>
            {mentor.position && (
              <p className="text-sm text-muted-foreground">{mentor.position}</p>
            )}
            {mentor.company?.name && (
              <div className="flex items-center justify-center gap-1 text-sm text-muted-foreground">
                <Building2 className="h-3 w-3" />
                <span>{mentor.company.name}</span>
              </div>
            )}
          </div>
        </div>
      ))}
      
      {selectedMentorId && (
        <ProfileDetailsDialog
          userId={selectedMentorId}
          open={dialogOpen}
          onOpenChange={setDialogOpen}
        />
      )}
    </div>
  );
}