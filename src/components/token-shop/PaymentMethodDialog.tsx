
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { CreditCard, Coins } from "lucide-react";

interface TokenPackage {
  id: string;
  name: string;
  description?: string;
  token_amount: number;
  price_usd: number;
  default_price: string;
  image_url?: string;
}

interface PaymentMethodDialogProps {
  isOpen: boolean;
  onClose: () => void;
  selectedPackage: TokenPackage | null;
  onContinueWithStripe: (priceId: string) => void;
}

export function PaymentMethodDialog({ 
  isOpen, 
  onClose, 
  selectedPackage, 
  onContinueWithStripe 
}: PaymentMethodDialogProps) {
  if (!selectedPackage) return null;

  const handleStripePayment = () => {
    onContinueWithStripe(selectedPackage.default_price);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Choose Payment Method</DialogTitle>
          <DialogDescription>
            Complete your purchase for {selectedPackage.name}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Package Summary */}
          <Card className="border-primary/20">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-primary to-primary/80 rounded-full flex items-center justify-center">
                    <Coins className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <div className="font-semibold">{selectedPackage.name}</div>
                    <div className="text-sm text-muted-foreground">
                      {selectedPackage.token_amount} tokens
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-xl font-bold">${selectedPackage.price_usd}</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Payment Methods */}
          <div className="space-y-3">
            <h4 className="font-medium text-sm text-muted-foreground">Select Payment Method</h4>
            
            <Card className="border-2 border-transparent hover:border-primary/50 transition-colors cursor-pointer" onClick={handleStripePayment}>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-blue-500 rounded flex items-center justify-center">
                    <CreditCard className="h-4 w-4 text-white" />
                  </div>
                  <div className="flex-1">
                    <div className="font-medium">Credit / Debit Card</div>
                    <div className="text-sm text-muted-foreground">Secure payment via Stripe</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleStripePayment} className="gap-2">
            <CreditCard className="h-4 w-4" />
            Continue with Stripe
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
