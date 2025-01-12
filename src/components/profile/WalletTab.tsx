import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Wallet, CircleDollarSign, ArrowUpRight, ArrowDownLeft } from "lucide-react";
import { format } from "date-fns";

interface WalletTabProps {
  profile: {
    id: string;
  } | null;
}

export function WalletTab({ profile }: WalletTabProps) {
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

  // Fetch transaction history
  const { data: transactions } = useQuery({
    queryKey: ['transactions', wallet?.id],
    queryFn: async () => {
      if (!wallet?.id) return [];
      const { data, error } = await supabase
        .from('token_transactions')
        .select('*')
        .eq('wallet_id', wallet.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    },
    enabled: !!wallet?.id
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
          <div className="flex items-center gap-2">
            <CircleDollarSign className="h-8 w-8 text-primary" />
            <span className="text-3xl font-bold">{wallet?.balance || 0}</span>
            <span className="text-muted-foreground">tokens</span>
          </div>
        </CardContent>
      </Card>

      {/* Transaction History */}
      <Card>
        <CardHeader>
          <CardTitle>Transaction History</CardTitle>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[400px] pr-4">
            <div className="space-y-4">
              {transactions?.map((transaction) => (
                <div
                  key={transaction.id}
                  className="flex items-center justify-between border-b pb-4 last:border-0"
                >
                  <div className="flex items-center gap-3">
                    {transaction.transaction_type === 'credit' ? (
                      <div className="rounded-full bg-green-100 p-2">
                        <ArrowDownLeft className="h-4 w-4 text-green-600" />
                      </div>
                    ) : (
                      <div className="rounded-full bg-red-100 p-2">
                        <ArrowUpRight className="h-4 w-4 text-red-600" />
                      </div>
                    )}
                    <div>
                      <p className="font-medium">
                        {transaction.description || 
                          (transaction.transaction_type === 'credit' ? 'Tokens Added' : 'Tokens Used')}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {format(new Date(transaction.created_at), 'MMM d, yyyy HH:mm')}
                      </p>
                    </div>
                  </div>
                  <div className={`font-medium ${
                    transaction.transaction_type === 'credit' ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {transaction.transaction_type === 'credit' ? '+' : '-'}{transaction.amount}
                  </div>
                </div>
              ))}
              {(!transactions || transactions.length === 0) && (
                <p className="text-center text-muted-foreground py-8">
                  No transactions yet
                </p>
              )}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
}