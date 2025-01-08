import { DialogContent, DialogHeader } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { ProfileHeader } from "./ProfileHeader";
import { ProfileEditForm } from "./ProfileEditForm";
import { ProfileView } from "./ProfileView";
import type { Session } from "@supabase/supabase-js";

interface ProfileDialogContentProps {
  profile: any;
  session: Session | null;
  isEditing: boolean;
  setIsEditing: (editing: boolean) => void;
  isOwnProfile: boolean;
  isMentor: boolean;
  handleBookSession: () => void;
}

export function ProfileDialogContent({
  profile,
  session,
  isEditing,
  setIsEditing,
  isOwnProfile,
  isMentor,
  handleBookSession,
}: ProfileDialogContentProps) {
  return (
    <DialogContent className="w-[95vw] sm:w-[90vw] md:max-w-2xl h-[90vh] sm:h-[85vh] bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/95 p-4 sm:p-6">
      <DialogHeader className="pb-0">
        <div className="relative pb-8 sm:pb-12">
          <ProfileHeader profile={profile} session={session} />
          {isMentor && (
            isOwnProfile ? (
              <Button 
                size="sm"
                onClick={() => setIsEditing(!isEditing)}
                className="absolute right-0 top-12 sm:top-16"
              >
                {isEditing ? "Cancel Editing" : "Edit Profile"}
              </Button>
            ) : (
              <Button 
                size="sm"
                onClick={handleBookSession}
                className="absolute left-1/2 -translate-x-1/2 bottom-0 h-8 sm:h-9 px-3 sm:px-4 text-sm w-[90%] sm:w-auto"
              >
                Book a Session
              </Button>
            )
          )}
        </div>
      </DialogHeader>

      <ScrollArea className="flex-1">
        {isEditing ? (
          <ProfileEditForm 
            profile={profile} 
            onCancel={() => setIsEditing(false)}
            onSuccess={() => setIsEditing(false)}
          />
        ) : (
          <ProfileView profile={profile} />
        )}
      </ScrollArea>
    </DialogContent>
  );
}