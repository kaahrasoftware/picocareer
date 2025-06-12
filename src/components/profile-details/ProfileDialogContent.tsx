
import { DialogContent, DialogHeader } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ProfileHeader } from "./ProfileHeader";
import { ProfileEditForm } from "./ProfileEditForm";
import { useNavigate } from "react-router-dom";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ProfileOverviewTab } from "./tabs/ProfileOverviewTab";
import { ProfileContentTab } from "./tabs/ProfileContentTab";
import { ProfileInsightsTab } from "./tabs/ProfileInsightsTab";
import { FileText, BarChart, User } from "lucide-react";
import type { Session } from "@supabase/supabase-js";

interface ProfileDialogContentProps {
  profile: any;
  session: Session | null;
  isEditing: boolean;
  setIsEditing: (editing: boolean) => void;
  isOwnProfile: boolean;
  isMentor: boolean;
  handleBookSession: () => void;
  onShare: () => void;
}

export function ProfileDialogContent({
  profile,
  session,
  isEditing,
  setIsEditing,
  isOwnProfile,
  isMentor,
  handleBookSession,
  onShare,
}: ProfileDialogContentProps) {
  const navigate = useNavigate();

  const handleEditClick = () => {
    if (isMentor && isOwnProfile) {
      // Redirect to profile page with edit mode
      navigate('/profile?tab=profile&edit=true');
    } else {
      setIsEditing(!isEditing);
    }
  };

  return (
    <DialogContent className="w-[95vw] sm:w-[90vw] md:max-w-4xl max-h-[90vh] bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/95 p-2 sm:p-4 md:p-6 flex flex-col overflow-auto">
      <DialogHeader className="pb-2 flex-shrink-0">
        <ProfileHeader 
          profile={profile} 
          session={session} 
          onShare={onShare}
        />
        {isMentor && isOwnProfile && (
          <div className="flex justify-end mt-2">
            <Button 
              size="sm"
              onClick={handleEditClick}
              variant="outline"
            >
              Edit Profile
            </Button>
          </div>
        )}
        {isMentor && !isOwnProfile && (
          <div className="flex justify-center mt-2">
            <Button 
              size="sm"
              onClick={handleBookSession}
              className="w-full max-w-xs"
            >
              Book a Session
            </Button>
          </div>
        )}
      </DialogHeader>

      {isEditing ? (
        <div className="flex-1 overflow-auto">
          <ProfileEditForm 
            profile={profile} 
            onCancel={() => setIsEditing(false)}
            onSuccess={() => setIsEditing(false)}
          />
        </div>
      ) : (
        <div className="flex-1 overflow-auto">
          <Tabs defaultValue="overview" className="h-full flex flex-col">
            <TabsList className="mb-3 flex-shrink-0">
              <TabsTrigger value="overview" className="flex items-center gap-1">
                <User className="h-4 w-4" />
                Overview
              </TabsTrigger>
              <TabsTrigger value="content" className="flex items-center gap-1">
                <FileText className="h-4 w-4" />
                Content
              </TabsTrigger>
              {isMentor && (
                <TabsTrigger value="insights" className="flex items-center gap-1">
                  <BarChart className="h-4 w-4" />
                  Insights
                </TabsTrigger>
              )}
            </TabsList>
            
            <div className="flex-1 overflow-auto">
              <TabsContent value="overview" className="h-full m-0 overflow-auto">
                <ProfileOverviewTab profile={profile} />
              </TabsContent>
              
              <TabsContent value="content" className="h-full m-0 overflow-auto">
                <ProfileContentTab profileId={profile.id} />
              </TabsContent>
              
              {isMentor && (
                <TabsContent value="insights" className="h-full m-0 overflow-auto">
                  <ProfileInsightsTab profileId={profile.id} />
                </TabsContent>
              )}
            </div>
          </Tabs>
        </div>
      )}
    </DialogContent>
  );
}
