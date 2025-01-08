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
    <DialogContent className="w-[95vw] sm:w-[90vw] md:max-w-2xl h-[85vh] sm:h-[85vh] bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/95 p-2 sm:p-4 md:p-6">
      <DialogHeader className="pb-0">
        <div className="relative pb-6 sm:pb-8">
          <ProfileHeader profile={profile} session={session} />
          {isMentor && (
            isOwnProfile ? (
              <Button 
                size="sm"
                onClick={() => setIsEditing(!isEditing)}
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

      <ScrollArea className="flex-1 px-1 sm:px-2">
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