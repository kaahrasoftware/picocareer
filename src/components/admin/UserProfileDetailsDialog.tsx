
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ProfileEditForm } from "@/components/profile-details/ProfileEditForm";

interface ExtendedProfile {
  id: string;
  first_name: string | null;
  last_name: string | null;
  email: string;
  // Add other profile properties as needed
}

interface UserProfileDetailsDialogProps {
  profile: ExtendedProfile;
  isOpen: boolean;
  onClose: () => void;
}

export function UserProfileDetailsDialog({ profile, isOpen, onClose }: UserProfileDetailsDialogProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>User Profile Details</DialogTitle>
        </DialogHeader>
        <ProfileEditForm 
          profile={profile} 
          onClose={onClose}
          onCancel={onClose}
          onSuccess={onClose}
        />
      </DialogContent>
    </Dialog>
  );
}
