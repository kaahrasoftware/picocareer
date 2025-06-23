
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ShoppingCart } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { WalletOverview } from "../token-shop/WalletOverview";
import { EnhancedTransactionHistory } from "./EnhancedTransactionHistory";
import { WalletAnalytics } from "./WalletAnalytics";
import { EarnUseTokensTab } from "./EarnUseTokensTab";
import { ReferralsTab } from "./ReferralsTab";
import { useWalletBalance } from "@/hooks/useWalletBalance";
import { useAuthSession } from "@/hooks/useAuthSession";

interface WalletDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

export function WalletDialog({ isOpen, onClose }: WalletDialogProps) {
  const { wallet } = useWalletBalance();
  const { session } = useAuthSession();
  const navigate = useNavigate();

  const handleBuyTokens = () => {
    onClose();
    navigate('/token-shop');
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle>Wallet</DialogTitle>
            <Button 
              onClick={handleBuyTokens}
              className="flex items-center gap-2"
              size="sm"
            >
              <ShoppingCart className="h-4 w-4" />
              Buy Tokens
            </Button>
          </div>
        </DialogHeader>
        
        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="transactions">Transactions</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
            <TabsTrigger value="referrals">Referrals</TabsTrigger>
            <TabsTrigger value="earn-use">Earn & Use</TabsTrigger>
          </TabsList>
          
          <TabsContent value="overview" className="mt-6">
            <WalletOverview />
          </TabsContent>
          
          <TabsContent value="transactions" className="mt-6">
            {session?.user?.id && <EnhancedTransactionHistory profileId={session.user.id} />}
          </TabsContent>
          
          <TabsContent value="analytics" className="mt-6">
            <WalletAnalytics />
          </TabsContent>
          
          <TabsContent value="referrals" className="mt-6">
            <ReferralsTab />
          </TabsContent>
          
          <TabsContent value="earn-use" className="mt-6">
            <EarnUseTokensTab />
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
