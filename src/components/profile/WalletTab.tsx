import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Coins, TrendingUp, Gift } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { EnhancedTransactionHistory } from '@/components/wallet/EnhancedTransactionHistory';
import { WalletAnalytics } from '@/components/wallet/WalletAnalytics';
import { useAuthSession } from '@/hooks/useAuthSession';

export function WalletTab() {
  const { session } = useAuthSession();
  const profileId = session?.user?.id;

  const { data: wallet, isLoading } = useQuery({
    queryKey: ['wallet', profileId],
    queryFn: async () => {
      if (!profileId) return null;
      
      const { data, error } = await supabase
        .from('wallets')
        .select('*')
        .eq('profile_id', profileId)
        .single();
        
      if (error) throw error;
      return data;
    },
    enabled: !!profileId
  });

  if (isLoading) {
    return <div>Loading wallet...</div>;
  }

  if (!wallet) {
    return <div>No wallet found</div>;
  }

  return (
    <div className="space-y-6">
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
      
      <EnhancedTransactionHistory walletId={wallet.id} />
    </div>
  );
}
