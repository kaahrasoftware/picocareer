import { User } from "@/types/user";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { MentorDetailsDialog } from "@/components/MentorDetailsDialog";
import { parseStats } from "@/types/stats";

interface MentorCardProps {
  mentor: User;
  featured?: boolean;
}

export const MentorCard = ({ mentor, featured }: MentorCardProps) => {
  const [showDetails, setShowDetails] = useState(false);
  const stats = parseStats(mentor.stats);

  return (
    <>
      <Card className="relative overflow-hidden group cursor-pointer hover:shadow-lg transition-shadow"
        onClick={() => setShowDetails(true)}>
        <div className="p-4">
          <div className="flex items-center gap-4 mb-4">
            <Avatar className="h-12 w-12">
              <AvatarImage src={mentor.image_url} alt={mentor.name} />
              <AvatarFallback>{mentor.name.charAt(0)}</AvatarFallback>
            </Avatar>
            <div>
              <h3 className="font-medium text-lg">{mentor.name}</h3>
              <p className="text-sm text-muted-foreground">{mentor.title} at {mentor.company}</p>
            </div>
          </div>
          
          {featured && (
            <div className="flex justify-between items-center mt-4 text-sm text-muted-foreground">
              <div>
                <span className="font-medium">{stats.mentees}</span> mentees
              </div>
              <div>
                <span className="font-medium">{stats.connected}</span> connected
              </div>
              <div>
                <span className="font-medium">{stats.recordings}</span> recordings
              </div>
            </div>
          )}

          <Button 
            variant="secondary" 
            className="w-full mt-4"
            onClick={(e) => {
              e.stopPropagation();
              setShowDetails(true);
            }}
          >
            View Profile
          </Button>
        </div>
      </Card>

      <MentorDetailsDialog
        mentor={mentor}
        open={showDetails}
        onOpenChange={setShowDetails}
      />
    </>
  );
};