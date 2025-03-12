
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

interface BookingConfirmationProps {
  isSubmitting: boolean;
  googleAuthError?: boolean;
  onCancel: () => void;
  onConfirm: () => void;
  isValid: boolean;
}

export function BookingConfirmation({ 
  isSubmitting, 
  googleAuthError = false, 
  onCancel, 
  onConfirm,
  isValid 
}: BookingConfirmationProps) {
  return (
    <div className="space-y-3 sm:space-y-4">
      {googleAuthError && (
        <Alert variant="destructive">
          <AlertCircle className="h-3 w-3 sm:h-4 sm:w-4" />
          <AlertDescription className="text-xs sm:text-sm">
            This mentor hasn't connected their Google account yet. Please select a different meeting platform or try again later.
          </AlertDescription>
        </Alert>
      )}

      <div className="flex justify-end gap-2 sm:gap-4">
        <Button variant="outline" onClick={onCancel} size="sm" className="text-xs sm:text-sm">
          Cancel
        </Button>
        <Button 
          onClick={onConfirm} 
          disabled={!isValid || isSubmitting}
          size="sm"
          className="text-xs sm:text-sm"
        >
          {isSubmitting ? "Booking..." : "Book Session"}
        </Button>
      </div>
    </div>
  );
}
