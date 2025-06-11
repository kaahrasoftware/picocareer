
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Wallet, CircleDollarSign, ShoppingCart } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { EnhancedTransactionHistory } from "@/components/wallet/EnhancedTransactionHistory";

interface WalletTabProps {
  profile: {
    id: string;
  } | null;
}

export function WalletTab({ profile }: WalletTabProps) {
  const navigate = useNavigate();

  // Fetch wallet data
  const { data: wallet } = useQuery({
    queryKey: ['wallet', profile?.id],
    queryFn: async () => {
      if (!profile?.id) return null;
      const { data, error } = await supabase
        .from('wallets')
        .select('*')
        .eq('profile_id', profile.id)
        .single();

      if (error) throw error;
      return data;
    },
    enabled: !!profile?.id
  });

  if (!profile) return null;

  return (
    <div className="space-y-6">
      {/* Token Balance Card */}
      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2">
            <Wallet className="h-5 w-5" />
            Token Balance
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CircleDollarSign className="h-8 w-8 text-primary" />
              <span className="text-3xl font-bold">{wallet?.balance || 0}</span>
              <span className="text-muted-foreground">tokens</span>
            </div>
            <Button 
              onClick={() => navigate('/token-shop')}
              className="gap-2"
            >
              <ShoppingCart className="h-4 w-4" />
              Buy Tokens
            </Button>
          </div>
          <div className="mt-4 p-4 bg-muted/50 rounded-lg">
            <p className="text-sm text-muted-foreground">
              Use tokens to access premium career insights, book mentor sessions, and unlock exclusive content.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Enhanced Transaction History */}
      {wallet && (
        <EnhancedTransactionHistory walletId={wallet.id} />
      )}
    </div>
  );
}
