import {
  Dialog,
  DialogContent,
} from "@/components/ui/dialog";

interface ProfileDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ProfileDialog({ open, onOpenChange }: ProfileDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] bg-kahra-darker text-white">
        <div className="p-6 text-center">
          <p>Profile functionality has been disabled.</p>
        </div>
      </DialogContent>
    </Dialog>
  );
}