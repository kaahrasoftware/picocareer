import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MajorDetails } from "./MajorDetails";
import { MajorHeader } from "./major/MajorHeader";
import { MajorSalary } from "./major/MajorSalary";
import { MajorSkillsList } from "./major/MajorSkillsList";
import { ProfileDetailsDialog } from "./ProfileDetailsDialog";
import { ProfileAvatar } from "@/components/ui/profile-avatar";

interface MentorCardProps {
  id: string;
  title?: string;  // Made optional
  company?: string; // Made optional to match Mentor type
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
  location?: string;
  bio?: string;
  skills?: string[];
}

export function MentorCard(props: MentorCardProps) {
  const [dialogOpen, setDialogOpen] = useState(false);

  return (
    <>
      <Card className="group relative overflow-hidden p-6 h-full flex flex-col">
        <div className="absolute inset-0 bg-gradient-to-br from-background/50 to-background opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        <div className="relative flex flex-col h-full">
          {/* Header Section with Avatar and Basic Info */}
          <div className="flex items-start gap-4 mb-4">
            <ProfileAvatar
              avatarUrl={props.imageUrl}
              fallback={props.name[0]}
              size="md"
              editable={false}
            />
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-2">
                {props.top_mentor && (
                  <Badge className="bg-gradient-to-r from-primary/80 to-primary text-white hover:from-primary hover:to-primary/90 flex items-center gap-1">
                    <Award className="h-3 w-3" />
                    Top Mentor
                  </Badge>
                )}
              </div>
              <h3 className="font-semibold truncate mb-2 text-left">{props.name}</h3>
              <p className="text-sm font-medium mb-1 truncate text-foreground/90 text-left">
                {props.career_title || props.title || "No position set"}
              </p>
              <div className="flex flex-col gap-1">
                {props.company && (
                  <div className="flex items-center gap-1 text-sm text-muted-foreground text-left">
                    <Building2 className="h-3 w-3 flex-shrink-0" />
                    <span className="truncate">{props.company}</span>
                  </div>
                )}
                {props.location && (
                  <div className="flex items-center gap-1 text-sm text-muted-foreground text-left">
                    <MapPin className="h-3 w-3 flex-shrink-0" />
                    <span className="truncate">{props.location}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Bio Section */}
          {props.bio && (
            <div className="w-full mb-4">
              <p className="text-sm text-muted-foreground line-clamp-2 text-left">{props.bio}</p>
            </div>
          )}

          {/* Skills Section */}
          {props.skills?.length > 0 && (
            <div className="w-full mb-4">
              <div className="flex flex-wrap gap-1.5">
                {props.skills.map((skill) => (
                  <Badge 
                    key={skill} 
                    variant="secondary" 
                    className="text-xs bg-[#F2FCE2] text-[#4B5563] hover:bg-[#E5F6D3] transition-colors border border-[#E2EFD9]"
                  >
                    {skill}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Button Section */}
          <div className="mt-auto w-full">
            <Button 
              variant="outline" 
              className="w-full bg-background hover:bg-muted/50 transition-colors"
              onClick={() => setDialogOpen(true)}
            >
              View Profile
            </Button>
          </div>
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
