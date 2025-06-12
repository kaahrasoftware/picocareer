
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
import { Coins, CreditCard, User, Calendar, Clock } from "lucide-react";
import { useWalletBalance } from "@/hooks/useWalletBalance";
import { useTokenOperations } from "@/hooks/useTokenOperations";
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
  const { balance, wallet, isLoading } = useWalletBalance();
  const { deductTokens } = useTokenOperations();
  const navigate = useNavigate();

  const hasSufficientFunds = balance >= SESSION_COST;

  const handleConfirmPayment = async () => {
    if (!wallet || !hasSufficientFunds) return;

    setIsProcessing(true);
    try {
      // Deduct tokens first
      await deductTokens.mutateAsync({
        walletId: wallet.id,
        amount: SESSION_COST,
        description: `Mentor session with ${sessionDetails.mentorName}`,
        category: 'session',
        metadata: {
          mentor_name: sessionDetails.mentorName,
          session_date: format(sessionDetails.date, 'yyyy-MM-dd'),
          session_time: sessionDetails.time,
          session_type: sessionDetails.sessionType
        }
      });

      // Process the booking
      await onConfirmPayment();
      onClose();
    } catch (error) {
      console.error('Payment failed:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleBuyTokens = () => {
    navigate('/token-shop');
    onClose();
  };

  if (isLoading) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-md">
          <div className="flex items-center justify-center p-6">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
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
                disabled={isProcessing}
                className="w-full gap-2"
              >
                <Coins className="h-4 w-4" />
                {isProcessing ? "Processing..." : `Confirm & Pay ${SESSION_COST} Tokens`}
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
            
            <Button variant="outline" onClick={onClose} className="w-full">
              Cancel
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
