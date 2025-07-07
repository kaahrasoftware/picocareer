
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { EnhancedTransactionHistory } from './EnhancedTransactionHistory';
import { WalletAnalytics } from './WalletAnalytics';
import { EarnUseTokensTab } from './EarnUseTokensTab';
import { ReferralsTab } from './ReferralsTab';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Coins } from 'lucide-react';

interface WalletDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  profileId: string;
}

export function WalletDialog({ open, onOpenChange, profileId }: WalletDialogProps) {
  const [activeTab, setActiveTab] = useState('overview');

  const { data: wallet, isLoading } = useQuery({
    queryKey: ['wallet', profileId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('wallets')
        .select('*')
        .eq('profile_id', profileId)
        .single();
        
      if (error) throw error;
      return data;
    },
    enabled: !!profileId && open
  });

  const handleNavigateToReferrals = () => {
    setActiveTab('referrals');
  };

  if (isLoading) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-hidden">
          <DialogHeader>
            <DialogTitle>Wallet</DialogTitle>
          </DialogHeader>
          <div>Loading wallet...</div>
        </DialogContent>
      </Dialog>
    );
  }

  if (!wallet) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-hidden">
          <DialogHeader>
            <DialogTitle>Wallet</DialogTitle>
          </DialogHeader>
          <div>No wallet found</div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle>Wallet</DialogTitle>
        </DialogHeader>
        
        <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="transactions">Transactions</TabsTrigger>
            <TabsTrigger value="earn-use">Earn & Use</TabsTrigger>
            <TabsTrigger value="referrals">Referrals</TabsTrigger>
          </TabsList>
          
          <div className="overflow-y-auto flex-1 mt-4">
            <TabsContent value="overview" className="space-y-6 mt-0">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Coins className="h-5 w-5" />
                    Token Balance
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-primary">
                    {wallet.balance} tokens
                  </div>
                </CardContent>
              </Card>

              <WalletAnalytics profileId={profileId} />
            </TabsContent>

            <TabsContent value="transactions" className="mt-0">
              <EnhancedTransactionHistory walletId={wallet.id} />
            </TabsContent>

            <TabsContent value="earn-use" className="mt-0">
              <EarnUseTokensTab onNavigateToReferrals={handleNavigateToReferrals} />
            </TabsContent>

            <TabsContent value="referrals" className="mt-0">
              <ReferralsTab />
            </TabsContent>
          </div>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
