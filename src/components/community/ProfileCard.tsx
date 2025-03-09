import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Building2, GraduationCap, Award, MapPin } from "lucide-react";
import { ProfileDetailsDialog } from "@/components/ProfileDetailsDialog";
import { useState } from "react";
import type { Profile } from "@/types/database/profiles";
import { ProfileAvatar } from "@/components/ui/profile-avatar";
import { useToast } from "@/hooks/use-toast";
import { useAuthSession } from "@/hooks/useAuthSession";
import { useNavigate } from "react-router-dom";

interface ProfileCardProps {
  profile: Profile & {
    company_name?: string | null;
    school_name?: string | null;
    academic_major?: string | null;
    career_title?: string | null;
  };
}

export function ProfileCard({ profile }: ProfileCardProps) {
  const [showDetails, setShowDetails] = useState(false);
  const { session } = useAuthSession();
  const { toast } = useToast();
  const navigate = useNavigate();

  const displayTitle = profile.career_title || profile.academic_major || "No position/major set";
  const displaySubtitle = profile.career_title 
    ? profile.company_name || "No company set"
    : profile.school_name || "No school set";

  const handleViewProfile = () => {
    if (!session) {
      toast({
        title: "Authentication Required",
        description: "Join our community to connect with amazing mentors and unlock your career potential!",
        variant: "default",
        className: "bg-green-50 border-green-200",
        action: (
          <Button
            onClick={() => navigate("/auth")}
            className="bg-green-500 text-white hover:bg-green-600"
            size="sm"
          >
            Login
          </Button>
        ),
      });
      return;
    }
    setShowDetails(true);
  };

  return (
    <>
      <Card className="group relative overflow-hidden p-6 h-full flex flex-col">
        <div className="absolute inset-0 bg-gradient-to-br from-background/50 to-background opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        <div className="relative flex flex-col h-full">
          {/* Header Section with Avatar and Basic Info */}
          <div className="flex items-start gap-4 mb-4">
            <ProfileAvatar
              avatarUrl={profile.avatar_url}
              fallback={profile.full_name?.[0] || 'U'}
              size="md"
              editable={false}
            />
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-2">
                {profile.top_mentor && (
                  <Badge className="bg-gradient-to-r from-primary/80 to-primary text-white hover:from-primary hover:to-primary/90 flex items-center gap-1">
                    <Award className="h-3 w-3" />
                    Top Mentor
                  </Badge>
                )}
              </div>
              <h3 className="font-semibold truncate mb-2">{profile.full_name}</h3>
              <p className="text-sm font-medium mb-1 truncate text-foreground/90">{displayTitle}</p>
              <div className="flex flex-col gap-1">
                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                  {profile.career_title ? (
                    <Building2 className="h-3 w-3 flex-shrink-0" />
                  ) : (
                    <GraduationCap className="h-3 w-3 flex-shrink-0" />
                  )}
                  <span className="truncate">{displaySubtitle}</span>
                </div>
                {profile.location && (
                  <div className="flex items-center gap-1 text-sm text-muted-foreground">
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
              <p className="text-sm text-muted-foreground line-clamp-2">{profile.bio}</p>
            </div>
          )}

          {/* Skills Section */}
          {profile.skills?.length > 0 && (
            <div className="w-full mb-4">
              <h4 className="text-sm font-medium mb-2">Skills</h4>
              <div className="flex flex-wrap gap-1.5">
                {profile.skills.slice(0, 3).map((skill) => (
                  <Badge 
                    key={skill} 
                    variant="secondary" 
                    className="text-xs bg-[#F2FCE2] text-[#4B5563] hover:bg-[#E5F6D3] transition-colors border border-[#E2EFD9]"
                  >
                    {skill}
                  </Badge>
                ))}
                {profile.skills.length > 3 && (
                  <Badge 
                    variant="secondary" 
                    className="text-xs bg-[#F2FCE2] text-[#4B5563] hover:bg-[#E5F6D3] transition-colors border border-[#E2EFD9]"
                  >
                    +{profile.skills.length - 3} more
                  </Badge>
                )}
              </div>
            </div>
          )}

          {/* Fields of Interest Section */}
          {profile.fields_of_interest?.length > 0 && (
            <div className="w-full mb-4">
              <h4 className="text-sm font-medium mb-2">Fields of Interest</h4>
              <div className="flex flex-wrap gap-1.5">
                {profile.fields_of_interest.slice(0, 3).map((field) => (
                  <Badge 
                    key={field} 
                    variant="secondary" 
                    className="text-xs bg-[#E2D4F0] text-[#4B5563] hover:bg-[#D4C4E3] transition-colors border border-[#D4C4E3]"
                  >
                    {field}
                  </Badge>
                ))}
                {profile.fields_of_interest.length > 3 && (
                  <Badge 
                    variant="secondary" 
                    className="text-xs bg-[#E2D4F0] text-[#4B5563] hover:bg-[#D4C4E3] transition-colors border border-[#D4C4E3]"
                  >
                    +{profile.fields_of_interest.length - 3} more
                  </Badge>
                )}
              </div>
            </div>
          )}

          {/* Keywords Section */}
          {profile.keywords?.length > 0 && (
            <div className="w-full mb-4">
              <h4 className="text-sm font-medium mb-2">Keywords</h4>
              <div className="flex flex-wrap gap-1.5">
                {profile.keywords.slice(0, 3).map((keyword) => (
                  <Badge 
                    key={keyword} 
                    variant="secondary" 
                    className="text-xs bg-[#D3E4FD] text-[#4B5563] hover:bg-[#C1D9F9] transition-colors border border-[#C1D9F9]"
                  >
                    {keyword}
                  </Badge>
                ))}
                {profile.keywords.length > 3 && (
                  <Badge 
                    variant="secondary" 
                    className="text-xs bg-[#D3E4FD] text-[#4B5563] hover:bg-[#C1D9F9] transition-colors border border-[#C1D9F9]"
                  >
                    +{profile.keywords.length - 3} more
                  </Badge>
                )}
              </div>
            </div>
          )}

          {/* Button Section */}
          <div className="mt-auto w-full">
            <Button 
              variant="outline" 
              className="w-full bg-background hover:bg-muted/50 transition-colors"
              onClick={handleViewProfile}
            >
              View Profile
            </Button>
          </div>
        </div>
      </Card>

      <ProfileDetailsDialog
        userId={profile.id}
        open={showDetails}
        onOpenChange={setShowDetails}
      />
    </>
  );
}