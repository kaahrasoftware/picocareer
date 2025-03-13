
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
    <div className="space-y-6 p-1">
      {googleAuthError && (
        <div className="mb-4 animate-fadeIn">
          <Alert variant="destructive" className="bg-red-50 border border-red-200 shadow-sm">
            <AlertCircle className="h-5 w-5 text-red-500" />
            <AlertDescription className="text-red-600 ml-2 text-sm leading-relaxed">
              This mentor hasn't connected their Google account yet. Please select a different meeting platform or try again later.
            </AlertDescription>
          </Alert>
        </div>
      )}

      {!isValid && (
        <div className="mb-4 animate-fadeIn">
          <div className="text-sm text-amber-600 bg-amber-50 p-4 rounded-md border border-amber-200 flex items-start gap-3 shadow-sm">
            <AlertCircle className="h-5 w-5 mt-0.5 flex-shrink-0" />
            <span className="leading-relaxed">Please fill out all required session details to continue with your booking.</span>
          </div>
        </div>
      )}

      <div className="flex flex-col sm:flex-row gap-4 sm:justify-end mt-6">
        <Button 
          variant="outline" 
          onClick={onCancel}
          className="gap-2 border-gray-300 hover:bg-gray-50 text-gray-700 h-11 w-full sm:w-auto sm:min-w-[140px] font-medium transition-all duration-200"
        >
          <X size={18} className="text-gray-500" />
          <span>Cancel</span>
        </Button>
        
        <Button 
          onClick={handleConfirmClick} 
          disabled={!isValid || isSubmitting}
          className={`
            gap-2 bg-sky-600 hover:bg-sky-700 text-white h-11 w-full sm:w-auto sm:min-w-[160px] 
            font-medium transition-all duration-300 relative shadow-sm
            ${isSubmitting ? 'pl-9' : ''}
            ${!isValid ? 'opacity-70 cursor-not-allowed' : ''}
          `}
        >
          {isSubmitting ? (
            <>
              <span className="absolute left-4 top-1/2 transform -translate-y-1/2">
                <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white"></div>
              </span>
              <span>Booking...</span>
            </>
          ) : (
            <>
              <Calendar size={18} />
              <span>Book Session</span>
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
