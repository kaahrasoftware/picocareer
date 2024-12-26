import {
  Dialog,
  DialogContent,
} from "@/components/ui/dialog";
import { MentorListHeader } from "./mentors/MentorListHeader";
import { MentorListContent } from "./mentors/MentorListContent";
import type { Mentor } from "@/types/mentor";

interface MentorListDialogProps {
  isOpen: boolean;
  onClose: () => void;
  mentors: Mentor[];
}

export const MentorListDialog = ({ isOpen, onClose, mentors }: MentorListDialogProps) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <MentorListHeader />
        <MentorListContent mentors={mentors} />
      </DialogContent>
    </Dialog>
  );
};