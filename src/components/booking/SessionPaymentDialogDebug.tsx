
import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CalendarDays, Clock, MessageSquare, Smartphone, Users, CreditCard, CheckCircle } from "lucide-react";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { SessionBookingStatusDebug } from "./SessionBookingStatusDebug";

interface SessionPaymentDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirmPayment: () => void;
  sessionDetails: {
    mentorName: string;
    date: Date;
    time: string;
    sessionType: string;
  };
}

export function SessionPaymentDialogDebug({
  isOpen,
  onClose,
  onConfirmPayment,
  sessionDetails
}: SessionPaymentDialogProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [showStatus, setShowStatus] = useState(false);

  const handleConfirmPayment = async () => {
    setIsProcessing(true);
    setShowStatus(true);
    try {
      await onConfirmPayment();
    } finally {
      setIsProcessing(false);
    }
  };

  const handleClose = () => {
    setShowStatus(false);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5 text-primary" />
            Confirm Session Booking (Debug Mode)
          </DialogTitle>
          <DialogDescription>
            Review your session details and confirm payment
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Session Details Card */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <Users className="h-4 w-4" />
                Session with {sessionDetails.mentorName}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-2 text-sm">
                <CalendarDays className="h-4 w-4 text-muted-foreground" />
                <span>{format(sessionDetails.date, 'EEEE, MMMM d, yyyy')}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <span>{sessionDetails.time}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <MessageSquare className="h-4 w-4 text-muted-foreground" />
                <span>{sessionDetails.sessionType}</span>
              </div>
            </CardContent>
          </Card>

          {/* Payment Summary */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Payment Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex justify-between items-center text-lg font-semibold">
                <span>Session Cost:</span>
                <Badge variant="outline" className="text-lg px-3 py-1">
                  25 Tokens
                </Badge>
              </div>
            </CardContent>
          </Card>

          {/* Debug Mode Notice */}
          <Card className="border-yellow-200 bg-yellow-50">
            <CardContent className="pt-4">
              <div className="flex items-center gap-2 text-yellow-800">
                <Smartphone className="h-4 w-4" />
                <span className="text-sm font-medium">Debug Mode Active</span>
              </div>
              <p className="text-xs text-yellow-700 mt-1">
                Enhanced logging and error tracking enabled. Check console for detailed logs.
              </p>
            </CardContent>
          </Card>

          {/* Status Display */}
          <SessionBookingStatusDebug 
            isVisible={showStatus}
            onClose={() => setShowStatus(false)}
          />

          {/* Action Buttons */}
          <div className="flex gap-3 pt-2">
            <Button
              variant="outline"
              onClick={handleClose}
              className="flex-1"
              disabled={isProcessing}
            >
              Cancel
            </Button>
            <Button
              onClick={handleConfirmPayment}
              disabled={isProcessing}
              className="flex-1"
            >
              {isProcessing ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                  Processing...
                </>
              ) : (
                <>
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Confirm & Pay 25 Tokens
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
