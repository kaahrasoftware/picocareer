
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useWalletBalance } from "@/hooks/useWalletBalance";
import { EnhancedTransactionHistory } from "./EnhancedTransactionHistory";
import { EarnUseTokensTab } from "./EarnUseTokensTab";

interface WalletDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

export function WalletDialog({ isOpen, onClose }: WalletDialogProps) {
  const { balance, isLoading } = useWalletBalance();
  const [activeTab, setActiveTab] = useState("overview");

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle>Wallet</DialogTitle>
        </DialogHeader>
        
        <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="transactions">Transactions</TabsTrigger>
            <TabsTrigger value="earn-use">Earn & Use</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>
          
          <div className="mt-6 overflow-y-auto max-h-[calc(90vh-140px)]">
            <TabsContent value="overview" className="space-y-6 mt-0">
              <div className="text-center space-y-2">
                <h3 className="text-lg font-semibold">Current Balance</h3>
                {isLoading ? (
                  <div className="animate-pulse">
                    <div className="h-8 bg-muted rounded w-24 mx-auto"></div>
                  </div>
                ) : (
                  <p className="text-3xl font-bold text-primary">{balance} tokens</p>
                )}
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-muted/50 p-4 rounded-lg text-center">
                  <p className="text-sm text-muted-foreground">This Month</p>
                  <p className="text-xl font-semibold">+125</p>
                </div>
                <div className="bg-muted/50 p-4 rounded-lg text-center">
                  <p className="text-sm text-muted-foreground">Total Earned</p>
                  <p className="text-xl font-semibold">1,240</p>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="transactions" className="mt-0">
              <EnhancedTransactionHistory />
            </TabsContent>
            
            <TabsContent value="earn-use" className="mt-0">
              <EarnUseTokensTab />
            </TabsContent>
            
            <TabsContent value="analytics" className="space-y-4 mt-0">
              <h3 className="text-lg font-semibold">Usage Analytics</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-muted/50 p-4 rounded-lg">
                  <p className="text-sm text-muted-foreground">Most Used For</p>
                  <p className="font-semibold">Mentorship Sessions</p>
                </div>
                <div className="bg-muted/50 p-4 rounded-lg">
                  <p className="text-sm text-muted-foreground">Average Monthly Spend</p>
                  <p className="font-semibold">85 tokens</p>
                </div>
              </div>
            </TabsContent>
          </div>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
