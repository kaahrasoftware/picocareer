
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { AlertCircle } from "lucide-react";

interface MajorDetailsErrorStateProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function MajorDetailsErrorState({ open, onOpenChange }: MajorDetailsErrorStateProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="p-6 flex flex-col items-center">
        <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mb-4 text-red-500">
          <AlertCircle className="h-6 w-6" />
        </div>
        <div className="text-center space-y-2">
          <h3 className="text-lg font-medium">Error Loading Major Details</h3>
          <p className="text-muted-foreground">
            We encountered an issue loading the major details. Please try again later.
          </p>
          <div className="pt-4">
            <Button 
              onClick={() => onOpenChange(false)}
              className="bg-gradient-to-r from-red-500 to-rose-600 hover:from-red-600 hover:to-rose-700 text-white border-none"
            >
              Close
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
