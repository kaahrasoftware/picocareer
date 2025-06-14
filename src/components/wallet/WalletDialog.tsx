
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { WalletOverview } from "./WalletOverview";
import { EnhancedTransactionHistory } from "./EnhancedTransactionHistory";
import { TokenShopHeader } from "../token-shop/TokenShopHeader";
import { ModernTokenPackageCard } from "../token-shop/ModernTokenPackageCard";
import { EarnUseTokensTab } from "./EarnUseTokensTab";

interface WalletDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

const tokenPackages = [
  {
    id: "starter",
    name: "Starter Pack",
    tokens: 100,
    price: 9.99,
    popular: false,
    features: ["Basic mentorship sessions", "Limited premium content", "Standard support"]
  },
  {
    id: "growth",
    name: "Growth Pack",
    tokens: 500,
    price: 39.99,
    popular: true,
    features: ["Extended mentorship sessions", "Full premium content access", "Priority support", "AI assessments"]
  },
  {
    id: "pro",
    name: "Pro Pack",
    tokens: 1200,
    price: 79.99,
    popular: false,
    features: ["Unlimited mentorship sessions", "All premium features", "24/7 support", "Exclusive content"]
  }
];

export function WalletDialog({ isOpen, onClose }: WalletDialogProps) {
  const [activeTab, setActiveTab] = useState("overview");

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle>My Wallet</DialogTitle>
        </DialogHeader>
        
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="transactions">Transactions</TabsTrigger>
            <TabsTrigger value="earn-use">Earn & Use</TabsTrigger>
            <TabsTrigger value="shop">Token Shop</TabsTrigger>
          </TabsList>
          
          <div className="mt-6 overflow-y-auto max-h-[calc(80vh-180px)]">
            <TabsContent value="overview" className="mt-0">
              <WalletOverview />
            </TabsContent>
            
            <TabsContent value="transactions" className="mt-0">
              <EnhancedTransactionHistory />
            </TabsContent>
            
            <TabsContent value="earn-use" className="mt-0">
              <EarnUseTokensTab />
            </TabsContent>
            
            <TabsContent value="shop" className="mt-0 space-y-6">
              <TokenShopHeader />
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {tokenPackages.map((pkg) => (
                  <ModernTokenPackageCard
                    key={pkg.id}
                    package={pkg}
                    onPurchase={() => {
                      console.log(`Purchasing ${pkg.name}`);
                    }}
                  />
                ))}
              </div>
            </TabsContent>
          </div>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
