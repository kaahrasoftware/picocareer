
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, Calendar, Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useState, useEffect } from "react";

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
  const { toast } = useToast();
  const [showSuccessAnimation, setShowSuccessAnimation] = useState(false);
  
  // Reset animation state when submission state changes
  useEffect(() => {
    if (isSubmitting) {
      setShowSuccessAnimation(false);
    }
  }, [isSubmitting]);

  const handleConfirmClick = () => {
    if (!isValid) {
      toast({
        title: "Missing Information",
        description: "Please fill out all required fields before booking.",
        variant: "destructive",
      });
      return;
    }
    onConfirm();
  };

  return (
    <div className="space-y-6">
      {googleAuthError && (
        <Alert variant="destructive" className="bg-red-50 border-red-200">
          <AlertCircle className="h-5 w-5 text-red-500" />
          <AlertDescription className="text-red-600">
            This mentor hasn't connected their Google account yet. Please select a different meeting platform or try again later.
          </AlertDescription>
        </Alert>
      )}

      <div className="flex flex-col gap-4 sm:flex-row sm:justify-end">
        <Button 
          variant="outline" 
          onClick={onCancel}
          className="gap-2 border-gray-300 hover:bg-gray-50 text-gray-700"
        >
          <X size={18} />
          Cancel
        </Button>
        
        <Button 
          onClick={handleConfirmClick} 
          disabled={!isValid || isSubmitting}
          className={`gap-2 bg-sky-600 hover:bg-sky-700 transition-all duration-300 relative ${isSubmitting ? 'pl-9' : ''}`}
        >
          {isSubmitting ? (
            <>
              <span className="absolute left-4 top-1/2 transform -translate-y-1/2">
                <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white"></div>
              </span>
              Booking...
            </>
          ) : (
            <>
              <Calendar size={18} />
              Book Session
            </>
          )}
        </Button>
      </div>

      {!isValid && (
        <p className="text-sm text-amber-600 bg-amber-50 p-3 rounded-md border border-amber-200 flex items-start gap-2">
          <AlertCircle className="h-5 w-5 mt-0.5 flex-shrink-0" />
          <span>Please fill out all required session details to continue.</span>
        </p>
      )}
    </div>
  );
}
