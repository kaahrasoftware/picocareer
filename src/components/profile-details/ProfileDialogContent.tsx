
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
    <DialogContent className="w-[95vw] sm:w-[90vw] md:max-w-2xl h-[85vh] sm:h-[85vh] bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/95 p-2 sm:p-4 md:p-6 flex flex-col">
      <DialogHeader className="pb-0">
        <div className="relative pb-6 sm:pb-8">
          <ProfileHeader 
            profile={profile} 
            session={session} 
            onShare={onShare}
          />
          {isMentor && (
            isOwnProfile ? (
              <Button 
                size="sm"
                onClick={handleEditClick}
                className="absolute right-0 top-10 sm:top-12"
              >
                {isEditing ? "Cancel Editing" : "Edit Profile"}
              </Button>
            ) : (
              <Button 
                size="sm"
                onClick={handleBookSession}
                className="absolute left-1/2 -translate-x-1/2 bottom-0 h-7 sm:h-8 px-2 sm:px-3 text-sm w-[85%] sm:w-auto"
              >
                Book a Session
              </Button>
            )
          )}
        </div>
      </DialogHeader>

      {isEditing ? (
        <ProfileEditForm 
          profile={profile} 
          onCancel={() => setIsEditing(false)}
          onSuccess={() => setIsEditing(false)}
        />
      ) : (
        <div className="flex-1 overflow-hidden">
          <Tabs defaultValue="overview" className="h-full flex flex-col">
            <TabsList className="mb-2">
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
            
            <div className="flex-1 overflow-hidden">
              <TabsContent value="overview" className="h-full m-0 overflow-hidden">
                <ProfileOverviewTab profile={profile} />
              </TabsContent>
              
              <TabsContent value="content" className="h-full m-0 overflow-hidden">
                <ProfileContentTab profileId={profile.id} />
              </TabsContent>
              
              {isMentor && (
                <TabsContent value="insights" className="h-full m-0 overflow-hidden">
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
