import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Wallet } from "lucide-react";
import { format } from "date-fns";

export function WalletTab({ userId }: { userId: string }) {
  // Fetch wallet data
  const { data: wallet } = useQuery({
    queryKey: ['wallet', userId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('wallets')
        .select('*')
        .eq('profile_id', userId)
        .single();
      
      if (error) throw error;
      return data;
    },
    enabled: !!userId,
  });

  // Fetch transaction history
  const { data: transactions } = useQuery({
    queryKey: ['transactions', userId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('token_transactions')
        .select(`
          *,
          wallet:wallets(profile:profiles(full_name))
        `)
        .eq('wallet_id', wallet?.id)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    },
    enabled: !!wallet?.id,
  });

  return (
    <div className="space-y-6">
      {/* Token Balance Card */}
      <Card className="p-6">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-primary/10 rounded-full">
            <Wallet className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h3 className="text-2xl font-semibold">
              {wallet?.balance || 0} Tokens
            </h3>
            <p className="text-muted-foreground">
              Current Balance
            </p>
          </div>
        </div>
      </Card>

      {/* Token Usage Information */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Token Usage</h3>
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Tokens can be used for:
          </p>
          <ul className="list-disc list-inside space-y-2 text-sm">
            <li>Booking mentoring sessions</li>
            <li>Accessing premium career insights</li>
            <li>Viewing detailed major information</li>
            <li>Unlocking special features</li>
          </ul>
        </div>
      </Card>

      {/* Transaction History */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Transaction History</h3>
        <div className="space-y-4">
          {transactions?.length === 0 ? (
            <p className="text-muted-foreground text-sm">No transactions yet</p>
          ) : (
            <div className="space-y-4">
              {transactions?.map((transaction) => (
                <div
                  key={transaction.id}
                  className="flex items-center justify-between py-3 border-b last:border-0"
                >
                  <div>
                    <p className="font-medium">{transaction.description}</p>
                    <p className="text-sm text-muted-foreground">
                      {format(new Date(transaction.created_at), 'PPp')}
                    </p>
                  </div>
                  <div className={`text-right ${
                    transaction.transaction_type === 'credit' 
                      ? 'text-green-600' 
                      : 'text-red-600'
                  }`}>
                    {transaction.transaction_type === 'credit' ? '+' : '-'}
                    {transaction.amount} Tokens
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}