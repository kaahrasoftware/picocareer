
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Coins, CreditCard, User, Calendar, Clock, AlertCircle, CheckCircle } from "lucide-react";
import { useWalletBalance } from "@/hooks/useWalletBalance";
import { useNavigate } from "react-router-dom";
import { format } from "date-fns";

const SESSION_COST = 25;

interface SessionPaymentDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirmPayment: () => Promise<void>;
  sessionDetails: {
    mentorName: string;
    date: Date;
    time: string;
    sessionType: string;
  };
}

export function SessionPaymentDialog({ 
  isOpen, 
  onClose, 
  onConfirmPayment,
  sessionDetails 
}: SessionPaymentDialogProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const { balance, isLoading } = useWalletBalance();
  const navigate = useNavigate();

  const hasSufficientFunds = balance >= SESSION_COST;

  const handleConfirmPayment = async () => {
    if (!hasSufficientFunds) return;

    setIsProcessing(true);
    setError(null);
    setSuccess(false);
    
    try {
      console.log('Confirming payment for session...');
      await onConfirmPayment();
      setSuccess(true);
      // Close dialog after a short delay to show success state
      setTimeout(() => {
        onClose();
        setSuccess(false);
      }, 2000);
    } catch (error: any) {
      console.error('Payment confirmation failed:', error);
      setError(error.message || 'Payment failed. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleBuyTokens = () => {
    navigate('/token-shop');
    onClose();
  };

  const handleClose = () => {
    if (!isProcessing) {
      setError(null);
      setSuccess(false);
      onClose();
    }
  };

  if (isLoading) {
    return (
      <Dialog open={isOpen} onOpenChange={handleClose}>
        <DialogContent className="sm:max-w-md">
          <div className="flex items-center justify-center p-6">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Coins className="h-5 w-5 text-primary" />
            Confirm Session Payment
          </DialogTitle>
          <DialogDescription>
            Review your session details and complete the payment
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Success State */}
          {success && (
            <Card className="border-green-200 bg-green-50">
              <CardContent className="p-4">
                <div className="flex items-center gap-3 text-center">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  <div>
                    <p className="font-medium text-green-800">Session Booked Successfully!</p>
                    <p className="text-sm text-green-600">Check your email for confirmation details.</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Error State */}
          {error && (
            <Card className="border-red-200 bg-red-50">
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <AlertCircle className="h-5 w-5 text-red-600 mt-0.5" />
                  <div>
                    <p className="font-medium text-red-800">Payment Failed</p>
                    <p className="text-sm text-red-600">{error}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Session Details */}
          <Card>
            <CardContent className="p-4">
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium">{sessionDetails.mentorName}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span>{format(sessionDetails.date, 'EEEE, MMMM dd, yyyy')}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span>{sessionDetails.time}</span>
                </div>
                <div className="text-sm text-muted-foreground">
                  {sessionDetails.sessionType}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Payment Summary */}
          <Card className="border-primary/20">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-3">
                <span className="font-medium">Session Cost</span>
                <div className="flex items-center gap-1">
                  <Coins className="h-4 w-4 text-primary" />
                  <span className="font-bold">{SESSION_COST} tokens</span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Your Balance</span>
                <div className="flex items-center gap-1">
                  <Coins className="h-4 w-4 text-muted-foreground" />
                  <span className={balance >= SESSION_COST ? "text-green-600" : "text-red-600"}>
                    {balance} tokens
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="space-y-2">
            {hasSufficientFunds ? (
              <Button 
                onClick={handleConfirmPayment} 
                disabled={isProcessing || success}
                className="w-full gap-2"
              >
                <Coins className="h-4 w-4" />
                {isProcessing ? "Processing..." : success ? "Booking Confirmed!" : `Confirm & Pay ${SESSION_COST} Tokens`}
              </Button>
            ) : (
              <Card className="border-orange-200 bg-orange-50">
                <CardContent className="p-4">
                  <div className="text-center space-y-3">
                    <p className="text-sm text-orange-700">
                      You need {SESSION_COST - balance} more tokens to book this session
                    </p>
                    <Button onClick={handleBuyTokens} className="w-full gap-2">
                      <CreditCard className="h-4 w-4" />
                      Buy Tokens
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
            
            <Button 
              variant="outline" 
              onClick={handleClose} 
              disabled={isProcessing}
              className="w-full"
            >
              {success ? "Close" : "Cancel"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
