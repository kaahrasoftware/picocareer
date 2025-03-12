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
    <div className="space-y-4">
      {googleAuthError && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            This mentor hasn't connected their Google account yet. Please select a different meeting platform or try again later.
          </AlertDescription>
        </Alert>
      )}

      <div className="flex justify-end gap-4">
        <Button variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button 
          onClick={onConfirm} 
          disabled={!isValid || isSubmitting}
        >
          {isSubmitting ? "Booking..." : "Book Session"}
        </Button>
      </div>
    </div>
  );
}