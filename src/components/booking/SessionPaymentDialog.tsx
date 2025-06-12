
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
import { useTokenOperations } from "@/hooks/useTokenOperations";
import { useNavigate } from "react-router-dom";
import { format } from "date-fns";
import { toast } from "sonner";

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
  const [processingStep, setProcessingStep] = useState<'payment' | 'booking' | 'complete' | null>(null);
  const { balance, isLoading, refreshBalance, wallet } = useWalletBalance();
  const { deductTokens } = useTokenOperations();
  const navigate = useNavigate();

  const hasSufficientFunds = balance >= SESSION_COST;

  const handleConfirmPayment = async () => {
    if (!hasSufficientFunds) {
      setError('Insufficient tokens for this session');
      return;
    }

    if (!wallet) {
      setError('Wallet not found. Please refresh the page.');
      return;
    }

    setIsProcessing(true);
    setError(null);
    setSuccess(false);
    setProcessingStep('payment');
    
    try {
      console.log('=== STARTING TOKEN DEDUCTION DEBUG ===');
      console.log('Wallet:', wallet);
      console.log('Balance:', balance);
      console.log('Session cost:', SESSION_COST);
      
      // Step 1: Deduct tokens first
      console.log('Step 1: Attempting token deduction...');
      const tokenResult = await deductTokens.mutateAsync({
        walletId: wallet.id,
        amount: SESSION_COST,
        description: `Session booking with ${sessionDetails.mentorName}`,
        category: 'session',
        metadata: {
          mentor_name: sessionDetails.mentorName,
          session_date: sessionDetails.date.toISOString(),
          session_time: sessionDetails.time,
          session_type: sessionDetails.sessionType
        }
      });

      console.log('Token deduction result:', tokenResult);

      if (!tokenResult.success) {
        throw new Error(tokenResult.message || 'Failed to deduct tokens');
      }

      console.log('✅ Tokens deducted successfully');
      setProcessingStep('booking');

      // Step 2: Proceed with session booking
      console.log('Step 2: Proceeding with session booking...');
      await onConfirmPayment();
      
      setProcessingStep('complete');
      setSuccess(true);
      console.log('✅ Session booking completed successfully');
      
      // Refresh wallet balance to show updated amount
      await refreshBalance();
      
      toast.success(`Session booked successfully! ${SESSION_COST} tokens deducted.`);
      
    } catch (error: any) {
      console.error('❌ Payment process failed:', error);
      setError(error.message || 'Payment failed. Please try again.');
      setProcessingStep(null);
      
      // TODO: Implement token refund if session booking fails after successful payment
      if (processingStep === 'booking') {
        console.log('TODO: Refund tokens since session booking failed after payment');
        toast.error('Session booking failed. Please contact support for token refund.');
      }
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
      setProcessingStep(null);
      onClose();
    }
  };

  const getProcessingMessage = () => {
    switch (processingStep) {
      case 'payment':
        return 'Processing payment...';
      case 'booking':
        return 'Booking session...';
      case 'complete':
        return 'Payment Complete!';
      default:
        return 'Processing...';
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
                <div className="flex items-center gap-3">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  <div>
                    <p className="font-medium text-green-800">Session Booked Successfully!</p>
                    <p className="text-sm text-green-600">25 tokens deducted. Check your email for confirmation details.</p>
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

          {/* Processing State */}
          {isProcessing && (
            <Card className="border-blue-200 bg-blue-50">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
                  <div>
                    <p className="font-medium text-blue-800">{getProcessingMessage()}</p>
                    <p className="text-sm text-blue-600">Please wait while we process your request...</p>
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

          {/* Debug Info (only show in development) */}
          {process.env.NODE_ENV === 'development' && (
            <Card className="border-gray-200 bg-gray-50">
              <CardContent className="p-3">
                <div className="text-xs text-gray-600">
                  <div>Wallet ID: {wallet?.id || 'None'}</div>
                  <div>Balance: {balance}</div>
                  <div>Processing Step: {processingStep || 'None'}</div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Action Buttons */}
          <div className="space-y-2">
            {hasSufficientFunds ? (
              <Button 
                onClick={handleConfirmPayment} 
                disabled={isProcessing || success}
                className="w-full gap-2"
              >
                <Coins className="h-4 w-4" />
                {isProcessing ? getProcessingMessage() : success ? "Payment Complete!" : `Confirm & Pay ${SESSION_COST} Tokens`}
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
