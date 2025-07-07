import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { EnhancedTransactionHistory } from './EnhancedTransactionHistory';
import { WalletAnalytics } from './WalletAnalytics';
import { EarnUseTokensTab } from './EarnUseTokensTab';
import { ReferralsTab } from './ReferralsTab';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Coins, CreditCard } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface WalletDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  profileId: string;
}

export function WalletDialog({ open, onOpenChange, profileId }: WalletDialogProps) {
  const [activeTab, setActiveTab] = useState('overview');
  const navigate = useNavigate();

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

  const handleBuyTokens = () => {
    navigate('/token-shop');
    onOpenChange(false);
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
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>Wallet</DialogTitle>
        </DialogHeader>
        
        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex flex-col flex-1 min-h-0">
          <TabsList className="grid w-full grid-cols-4 flex-shrink-0">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="transactions">Transactions</TabsTrigger>
            <TabsTrigger value="earn-use">Earn & Use</TabsTrigger>
            <TabsTrigger value="referrals">Referrals</TabsTrigger>
          </TabsList>
          
          <div className="flex-1 min-h-0 mt-4">
            <TabsContent value="overview" className="mt-0 h-full">
              <ScrollArea className="h-[calc(80vh-12rem)]">
                <div className="space-y-6 pr-4">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Coins className="h-5 w-5" />
                        Token Balance
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="text-3xl font-bold text-primary">
                        {wallet.balance} tokens
                      </div>
                      <Button 
                        onClick={handleBuyTokens}
                        className="w-full sm:w-auto flex items-center gap-2"
                      >
                        <CreditCard className="h-4 w-4" />
                        Buy More Tokens
                      </Button>
                    </CardContent>
                  </Card>

                  <WalletAnalytics profileId={profileId} />
                </div>
              </ScrollArea>
            </TabsContent>

            <TabsContent value="transactions" className="mt-0 h-full">
              <div className="h-[calc(80vh-12rem)]">
                <EnhancedTransactionHistory walletId={wallet.id} />
              </div>
            </TabsContent>

            <TabsContent value="earn-use" className="mt-0 h-full">
              <ScrollArea className="h-[calc(80vh-12rem)]">
                <div className="pr-4">
                  <EarnUseTokensTab onNavigateToReferrals={handleNavigateToReferrals} />
                </div>
              </ScrollArea>
            </TabsContent>

            <TabsContent value="referrals" className="mt-0 h-full">
              <ScrollArea className="h-[calc(80vh-12rem)]">
                <div className="pr-4">
                  <ReferralsTab />
                </div>
              </ScrollArea>
            </TabsContent>
          </div>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
