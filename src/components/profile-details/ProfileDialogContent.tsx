
import { DialogContent, DialogHeader } from "@/components/ui/dialog";
import { ProfileTabs } from "@/components/profile/ProfileTabs";
import { ProfileHeader } from "./ProfileHeader";
import { ProfileEditForm } from "./ProfileEditForm";
import { Button } from "@/components/ui/button";
import { Pencil } from "lucide-react";
import type { Profile } from "@/types/database/profiles";
import type { Session } from "@supabase/supabase-js";

interface ProfileDialogContentProps {
  profile: Profile & {
    company_name?: string | null;
    school_name?: string | null;
    academic_major?: string | null;
    career_title?: string | null;
  };
  session: Session | null;
  isEditing: boolean;
  setIsEditing: (value: boolean) => void;
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
  onShare
}: ProfileDialogContentProps) {
  return (
    <DialogContent className="max-w-2xl h-[90vh] flex flex-col p-0 gap-0">
      <DialogHeader className="px-6 pt-6 pb-4">
        <div className="flex justify-between items-center">
          <div className="flex-1" />
          {isOwnProfile && !isEditing && (
            <Button 
              onClick={() => setIsEditing(true)}
              variant="ghost"
              size="sm"
              className="flex items-center gap-1"
            >
              <Pencil className="h-4 w-4" />
              Edit
            </Button>
          )}
          {!isOwnProfile && (
            <Button 
              onClick={handleBookSession}
              size="sm"
              className="ml-auto"
            >
              Book Session
            </Button>
          )}
        </div>
      </DialogHeader>
      
      <div className="flex-1 overflow-auto">
        <div className="px-6 space-y-6 pb-6">
          <ProfileHeader profile={profile} session={session} onShare={onShare} />
          
          {isEditing ? (
            <ProfileEditForm 
              profile={profile}
              onCancel={() => setIsEditing(false)}
              onSuccess={() => setIsEditing(false)}
            />
          ) : (
            <ProfileTabs profile={profile} isMentor={isMentor} onTabChange={() => {}} />
          )}
        </div>
      </div>
    </DialogContent>
  );
}
