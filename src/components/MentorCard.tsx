import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Award, Building2 } from "lucide-react";
import { ProfileDetailsDialog } from "./ProfileDetailsDialog";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { useToast } from "@/hooks/use-toast";
import { useProfileSession } from "@/hooks/useProfileSession";
import { useNavigate } from "react-router-dom";

interface MentorCardProps {
  id: string;
  title?: string;
  company?: string;
  imageUrl: string;
  name: string;
  stats: {
    mentees: string;
    connected: string;
    recordings: string;
  };
  top_mentor?: boolean;
  position?: string;
  career_title?: string;
}

export function MentorCard(props: MentorCardProps) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const { toast } = useToast();
  const { session } = useProfileSession();
  const navigate = useNavigate();

  const handleViewProfile = () => {
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
    setDialogOpen(true);
  };

  return (
    <>
      <Card className="group relative overflow-hidden p-6 h-full flex flex-col hover:shadow-md transition-all duration-300">
        <div className="relative flex flex-col items-center text-center h-full">
          {/* Profile Picture and Badge Section */}
          <div className="relative mb-4">
            <Avatar className="w-20 h-20">
              <AvatarImage src={props.imageUrl} alt={props.name} />
              <AvatarFallback>{props.name[0]}</AvatarFallback>
            </Avatar>
            {props.top_mentor && (
              <Badge className="absolute -top-2 -right-2 bg-gradient-to-r from-primary/80 to-primary text-white hover:from-primary hover:to-primary/90 flex items-center gap-1">
                <Award className="h-3 w-3" />
                Top Mentor
              </Badge>
            )}
          </div>

          {/* Name and Position Section */}
          <div className="flex-1 min-w-0 mb-4">
            <h3 className="font-semibold text-lg mb-2">{props.name}</h3>
            <p className="text-sm font-medium text-foreground/90">
              {props.career_title || props.title || "No position set"}
            </p>
            {props.company && (
              <div className="flex items-center justify-center gap-1 text-sm text-muted-foreground mt-1">
                <Building2 className="h-3 w-3 flex-shrink-0" />
                <span className="truncate">{props.company}</span>
              </div>
            )}
          </div>

          {/* Button Section */}
          <Button 
            variant="outline" 
            className="w-full bg-background hover:bg-muted/50 transition-colors"
            onClick={handleViewProfile}
          >
            View Profile
          </Button>
        </div>
      </Card>

      <ProfileDetailsDialog
        userId={props.id}
        open={dialogOpen}
        onOpenChange={setDialogOpen}
      />
    </>
  );
}