
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { WalletOverview } from "../token-shop/WalletOverview";
import { EnhancedTransactionHistory } from "./EnhancedTransactionHistory";
import { WalletAnalytics } from "./WalletAnalytics";
import { EarnUseTokensTab } from "./EarnUseTokensTab";
import { ReferralsTab } from "./ReferralsTab";
import { useWalletBalance } from "@/hooks/useWalletBalance";

interface WalletDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

export function WalletDialog({ isOpen, onClose }: WalletDialogProps) {
  const { wallet } = useWalletBalance();

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Wallet</DialogTitle>
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
            {wallet && <EnhancedTransactionHistory walletId={wallet.id} />}
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
