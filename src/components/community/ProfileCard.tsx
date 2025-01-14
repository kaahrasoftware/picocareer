import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Award, Building2, MapPin } from "lucide-react";
import { ProfileAvatar } from "@/components/ui/profile-avatar";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { ProfileDetailsDialog } from "@/components/ProfileDetailsDialog";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { useAuthSession } from "@/hooks/useAuthSession";
import type { Profile } from "@/types/database/profiles";

interface ProfileCardProps {
  profile: Profile;
  onClick?: (profile: Profile) => void;
}

export function ProfileCard({ profile, onClick }: ProfileCardProps) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();
  const { session } = useAuthSession();

  // Get the first 3 items for each array and calculate remaining counts
  const displaySkills = profile.skills?.slice(0, 3) || [];
  const remainingSkillsCount = profile.skills ? profile.skills.length - 3 : 0;

  const displayInterests = profile.fields_of_interest?.slice(0, 3) || [];
  const remainingInterestsCount = profile.fields_of_interest ? profile.fields_of_interest.length - 3 : 0;

  const displayKeywords = profile.keywords?.slice(0, 3) || [];
  const remainingKeywordsCount = profile.keywords ? profile.keywords.length - 3 : 0;

  const handleClick = () => {
    if (!session) {
      toast({
        title: "Authentication required",
        description: "Please sign in to view mentor profiles.",
        variant: "destructive",
      });
      setTimeout(() => {
        navigate("/auth");
      }, 1000); // Add a small delay to ensure the toast is visible
      return;
    }
    
    setDialogOpen(true);
    if (onClick) {
      onClick(profile);
    }
  };

  return (
    <>
      <Card 
        className="group relative overflow-hidden p-6 h-full flex flex-col cursor-pointer hover:bg-accent/50 transition-colors"
        onClick={handleClick}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-background/50 to-background opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        <div className="relative flex flex-col h-full">
          {/* Header Section with Avatar and Basic Info */}
          <div className="flex items-start gap-4 mb-4">
            <ProfileAvatar
              avatarUrl={profile.avatar_url || ""}
              size="md"
              editable={false}
            />
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-2">
                {profile.top_mentor ? (
                  <Badge className="bg-gradient-to-r from-primary/80 to-primary text-white hover:from-primary hover:to-primary/90 flex items-center gap-1">
                    <Award className="h-3 w-3" />
                    Top Mentor
                  </Badge>
                ) : (
                  <Badge variant="secondary" className="bg-primary/20 text-primary hover:bg-primary/30">
                    mentor
                  </Badge>
                )}
              </div>
              <h3 className="font-semibold truncate mb-2 text-left">{profile.full_name}</h3>
              <p className="text-sm font-medium mb-1 truncate text-foreground/90 text-left">
                {profile.career?.title || "No position set"}
              </p>
              <div className="flex flex-col gap-1">
                {profile.company_id && (
                  <div className="flex items-center gap-1 text-sm text-muted-foreground text-left">
                    <Building2 className="h-3 w-3 flex-shrink-0" />
                    <span className="truncate">{profile.company?.name}</span>
                  </div>
                )}
                {profile.location && (
                  <div className="flex items-center gap-1 text-sm text-muted-foreground text-left">
                    <MapPin className="h-3 w-3 flex-shrink-0" />
                    <span className="truncate">{profile.location}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Bio Section */}
          {profile.bio && (
            <div className="w-full mb-4">
              <p className="text-sm text-muted-foreground line-clamp-2 text-left">{profile.bio}</p>
            </div>
          )}

          {/* Skills Section */}
          {profile.skills && profile.skills.length > 0 && (
            <div className="w-full mb-4">
              <h4 className="text-sm font-medium text-muted-foreground mb-2">Skills</h4>
              <div className="flex flex-wrap gap-1.5">
                {displaySkills.map((skill) => (
                  <Badge 
                    key={skill} 
                    variant="secondary" 
                    className="text-xs bg-[#F2FCE2] text-[#4B5563] hover:bg-[#E5F6D3] transition-colors border border-[#E2EFD9]"
                  >
                    {skill}
                  </Badge>
                ))}
                {remainingSkillsCount > 0 && (
                  <Badge 
                    variant="secondary"
                    className="text-xs bg-[#F2FCE2] text-[#4B5563] hover:bg-[#E5F6D3] transition-colors border border-[#E2EFD9]"
                  >
                    +{remainingSkillsCount} more
                  </Badge>
                )}
              </div>
            </div>
          )}

          {/* Fields of Interest Section */}
          {profile.fields_of_interest && profile.fields_of_interest.length > 0 && (
            <div className="w-full mb-4">
              <h4 className="text-sm font-medium text-muted-foreground mb-2">Fields of Interest</h4>
              <div className="flex flex-wrap gap-1.5">
                {displayInterests.map((interest) => (
                  <Badge 
                    key={interest} 
                    variant="secondary" 
                    className="text-xs bg-[#D3E4FD] text-[#4B5563] hover:bg-[#C1D9F9] transition-colors border border-[#C1D9F9]"
                  >
                    {interest}
                  </Badge>
                ))}
                {remainingInterestsCount > 0 && (
                  <Badge 
                    variant="secondary"
                    className="text-xs bg-[#D3E4FD] text-[#4B5563] hover:bg-[#C1D9F9] transition-colors border border-[#C1D9F9]"
                  >
                    +{remainingInterestsCount} more
                  </Badge>
                )}
              </div>
            </div>
          )}

          {/* Keywords Section */}
          {profile.keywords && profile.keywords.length > 0 && (
            <div className="w-full mb-4">
              <h4 className="text-sm font-medium text-muted-foreground mb-2">Keywords</h4>
              <div className="flex flex-wrap gap-1.5">
                {displayKeywords.map((keyword) => (
                  <Badge 
                    key={keyword} 
                    variant="secondary" 
                    className="text-xs bg-[#FDE2E2] text-[#4B5563] hover:bg-[#FACACA] transition-colors border border-[#FAD4D4]"
                  >
                    {keyword}
                  </Badge>
                ))}
                {remainingKeywordsCount > 0 && (
                  <Badge 
                    variant="secondary"
                    className="text-xs bg-[#FDE2E2] text-[#4B5563] hover:bg-[#FACACA] transition-colors border border-[#FAD4D4]"
                  >
                    +{remainingKeywordsCount} more
                  </Badge>
                )}
              </div>
            </div>
          )}

          {/* View Profile Button */}
          <div className="mt-auto pt-4">
            <Button 
              variant="outline" 
              className="w-full bg-background hover:bg-muted/50 transition-colors"
              onClick={handleClick}
            >
              View Profile
            </Button>
          </div>
        </div>
      </Card>

      <ProfileDetailsDialog
        userId={profile.id}
        open={dialogOpen}
        onOpenChange={setDialogOpen}
      />
    </>
  );
}