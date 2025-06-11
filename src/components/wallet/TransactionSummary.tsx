
import React from 'react';
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, TrendingDown, RefreshCw, DollarSign } from "lucide-react";

interface TransactionSummaryProps {
  walletId: string;
  dateFrom?: Date | null;
  dateTo?: Date | null;
}

export function TransactionSummary({ walletId, dateFrom, dateTo }: TransactionSummaryProps) {
  const { data: summary, isLoading } = useQuery({
    queryKey: ['transaction-summary', walletId, dateFrom, dateTo],
    queryFn: async () => {
      const { data, error } = await supabase.rpc('get_transaction_summary', {
        p_wallet_id: walletId,
        p_start_date: dateFrom?.toISOString() || null,
        p_end_date: dateTo?.toISOString() || null
      });

      if (error) throw error;
      return data;
    },
    enabled: !!walletId
  });

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader className="pb-2">
              <div className="h-4 bg-muted rounded w-1/2"></div>
            </CardHeader>
            <CardContent>
              <div className="h-8 bg-muted rounded w-3/4"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (!summary) return null;

  const summaryCards = [
    {
      title: "Total Purchased",
      value: summary.total_purchased,
      icon: TrendingUp,
      color: "text-green-600",
      bgColor: "bg-green-100"
    },
    {
      title: "Total Spent",
      value: summary.total_spent,
      icon: TrendingDown,
      color: "text-red-600",
      bgColor: "bg-red-100"
    },
    {
      title: "Total Refunded",
      value: summary.total_refunded,
      icon: RefreshCw,
      color: "text-blue-600",
      bgColor: "bg-blue-100"
    },
    {
      title: "Net Balance",
      value: summary.net_tokens,
      icon: DollarSign,
      color: summary.net_tokens >= 0 ? "text-green-600" : "text-red-600",
      bgColor: summary.net_tokens >= 0 ? "bg-green-100" : "bg-red-100"
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {summaryCards.map((card) => (
        <Card key={card.title}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{card.title}</CardTitle>
            <div className={`p-2 rounded-full ${card.bgColor}`}>
              <card.icon className={`h-4 w-4 ${card.color}`} />
            </div>
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${card.color}`}>
              {card.value}
            </div>
            <p className="text-xs text-muted-foreground">
              From {summary.transaction_count} transactions
            </p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
