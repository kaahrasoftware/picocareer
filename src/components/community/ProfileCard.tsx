
import { useState } from "react";
import { ProfileDetailsDialog } from "@/components/ProfileDetailsDialog";
import { useAuthSession } from "@/hooks/useAuthSession";
import { useNavigate } from "react-router-dom";
import { ProfileCardHeader } from "./profile-card/ProfileCardHeader";
import { ProfileCardBio } from "./profile-card/ProfileCardBio";
import { ProfileCardSkills } from "./profile-card/ProfileCardSkills";
import { ProfileCardInterests } from "./profile-card/ProfileCardInterests";
import { ProfileCardKeywords } from "./profile-card/ProfileCardKeywords";
import { ProfileCardFooter } from "./profile-card/ProfileCardFooter";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import type { Profile } from "@/types/database/profiles";

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

  const handleViewProfile = () => {
    if (!session) {
      toast({
        title: "Authentication Required",
        description: "Join our community to connect with amazing mentors and unlock your career potential!",
        variant: "default",
        className: "bg-green-50 border-green-200",
        action: (
          <button
            onClick={() => navigate("/auth")}
            className="bg-green-500 text-white hover:bg-green-600 h-8 px-3 rounded text-xs font-medium"
          >
            Login
          </button>
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
          <ProfileCardHeader profile={profile} />
          
          {profile.bio && <ProfileCardBio bio={profile.bio} />}
          
          {profile.skills?.length > 0 && (
            <ProfileCardSkills skills={profile.skills} />
          )}
          
          {profile.fields_of_interest?.length > 0 && (
            <ProfileCardInterests fields={profile.fields_of_interest} />
          )}
          
          {profile.keywords?.length > 0 && (
            <ProfileCardKeywords keywords={profile.keywords} />
          )}
          
          <ProfileCardFooter onViewProfile={handleViewProfile} />
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
