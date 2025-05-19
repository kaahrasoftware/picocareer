
import { Dialog, DialogContent } from "@/components/ui/dialog";

interface MajorDetailsErrorStateProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function MajorDetailsErrorState({ open, onOpenChange }: MajorDetailsErrorStateProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <div className="p-4 text-center text-red-500">
          Error loading major details. Please try again later.
        </div>
      </DialogContent>
    </Dialog>
  );
}
