import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Building2, GraduationCap, Award } from "lucide-react";
import { ProfileDetailsDialog } from "@/components/ProfileDetailsDialog";
import { useState } from "react";
import { cn } from "@/lib/utils";

interface ProfileCardProps {
  profile: {
    id: string;
    full_name: string | null;
    avatar_url: string | null;
    position: string | null;
    company_name: string | null;
    academic_major: string | null;
    school_name: string | null;
    skills: string[] | null;
    user_type: string | null;
    top_mentor: boolean | null;
  };
}

export function ProfileCard({ profile }: ProfileCardProps) {
  const [showDetails, setShowDetails] = useState(false);

  const displayTitle = profile.position || profile.academic_major || "No position/major set";
  const displaySubtitle = profile.position 
    ? profile.company_name || "No company set"
    : profile.school_name || "No school set";

  const getBadgeClass = (userType: string | null) => {
    switch (userType) {
      case 'mentor':
        return 'bg-kahra-primary hover:bg-kahra-primary text-white';
      case 'student':
        return 'bg-green-600 hover:bg-green-600 text-white';
      default:
        return 'bg-kahra-accent hover:bg-kahra-accent text-white';
    }
  };

  return (
    <>
      <Card className="p-6 hover:shadow-lg transition-shadow duration-200">
        <div className="flex items-start gap-4">
          <Avatar className="h-16 w-16">
            <AvatarImage src={profile.avatar_url || ''} alt={profile.full_name || 'User'} />
            <AvatarFallback>{profile.full_name?.[0] || 'U'}</AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="font-semibold truncate">{profile.full_name}</h3>
              <Badge className={cn("capitalize", getBadgeClass(profile.user_type))}>
                {profile.user_type || 'student'}
              </Badge>
              {profile.top_mentor && (
                <Badge className="bg-yellow-500/20 text-yellow-700 hover:bg-yellow-500/30 flex items-center gap-1">
                  <Award className="h-3 w-3" />
                  Top Mentor
                </Badge>
              )}
            </div>
            <p className="text-sm font-medium mb-1 truncate">{displayTitle}</p>
            <div className="flex items-center gap-1 text-sm text-muted-foreground mb-3">
              {profile.position ? (
                <Building2 className="h-3 w-3" />
              ) : (
                <GraduationCap className="h-3 w-3" />
              )}
              <span className="truncate">{displaySubtitle}</span>
            </div>
            <div className="flex flex-wrap gap-1 mb-4">
              {profile.skills?.slice(0, 3).map((skill) => (
                <Badge key={skill} variant="secondary" className="text-xs">
                  {skill}
                </Badge>
              ))}
              {(profile.skills?.length || 0) > 3 && (
                <Badge variant="secondary" className="text-xs">
                  +{(profile.skills?.length || 0) - 3} more
                </Badge>
              )}
            </div>
            <Button 
              variant="outline" 
              className="w-full"
              onClick={() => setShowDetails(true)}
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