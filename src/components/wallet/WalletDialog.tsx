
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Wallet, History, CreditCard, Star } from "lucide-react";
import { useWalletBalance } from "@/hooks/useWalletBalance";
import { EnhancedTransactionHistory } from "./EnhancedTransactionHistory";
import { EarnUseTokensTab } from "./EarnUseTokensTab";

interface WalletDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

export function WalletDialog({ isOpen, onClose }: WalletDialogProps) {
  const { wallet, balance, isLoading } = useWalletBalance();
  const [activeTab, setActiveTab] = useState("overview");

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Wallet className="h-5 w-5" />
            Wallet
          </DialogTitle>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview" className="flex items-center gap-2">
              <Wallet className="h-4 w-4" />
              <span className="hidden sm:inline">Overview</span>
            </TabsTrigger>
            <TabsTrigger value="history" className="flex items-center gap-2">
              <History className="h-4 w-4" />
              <span className="hidden sm:inline">History</span>
            </TabsTrigger>
            <TabsTrigger value="earn-use" className="flex items-center gap-2">
              <Star className="h-4 w-4" />
              <span className="hidden sm:inline">Earn & Use</span>
            </TabsTrigger>
            <TabsTrigger value="purchase" className="flex items-center gap-2">
              <CreditCard className="h-4 w-4" />
              <span className="hidden sm:inline">Purchase</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="mt-6">
            <div className="text-center py-8">
              <div className="text-4xl font-bold text-primary mb-2">
                {isLoading ? "..." : balance.toLocaleString()}
              </div>
              <div className="text-gray-600 mb-6">Available Tokens</div>
              
              <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-6 max-w-md mx-auto">
                <h3 className="font-semibold text-gray-900 mb-2">Token Value</h3>
                <p className="text-sm text-gray-600">
                  Use your tokens to access premium content, book mentorship sessions, 
                  and unlock exclusive features across the platform.
                </p>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="history" className="mt-6">
            {wallet && <EnhancedTransactionHistory walletId={wallet.id} />}
          </TabsContent>

          <TabsContent value="earn-use" className="mt-6">
            <EarnUseTokensTab />
          </TabsContent>

          <TabsContent value="purchase" className="mt-6">
            <div className="text-center py-8">
              <div className="text-gray-600 mb-4">Token purchasing coming soon!</div>
              <p className="text-sm text-gray-500">
                We're working on adding convenient ways to purchase tokens. 
                In the meantime, earn tokens through daily activities and referrals.
              </p>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
