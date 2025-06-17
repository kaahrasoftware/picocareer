
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ProfileEditForm } from "@/components/profile-details/ProfileEditForm";
import type { Profile } from "@/types/database/profiles";

interface UserProfileDetailsDialogProps {
  profile?: Profile & {
    company_name?: string | null;
    school_name?: string | null;
    academic_major?: string | null;
    career_title?: string | null;
  };
  isOpen: boolean;
  onClose: () => void;
  userId?: string;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export function UserProfileDetailsDialog({ 
  profile, 
  isOpen, 
  open, 
  onClose, 
  onOpenChange 
}: UserProfileDetailsDialogProps) {
  const dialogOpen = isOpen || open || false;
  
  const handleOpenChange = (newOpen: boolean) => {
    if (onOpenChange) {
      onOpenChange(newOpen);
    } else if (!newOpen) {
      onClose();
    }
  };

  if (!profile) {
    return null;
  }

  return (
    <Dialog open={dialogOpen} onOpenChange={handleOpenChange}>
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
