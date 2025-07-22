
import React, { useState } from 'react';
import { DataTable } from "@/components/ui/data-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ColumnDef } from "@tanstack/react-table";
import { formatDistanceToNow } from 'date-fns';
import { Download, Filter, RefreshCw } from "lucide-react";
import { useSystemTransactionHistory } from '@/hooks/useSystemTransactionHistory';
import { toast } from 'sonner';

interface TransactionData {
  id: string;
  walletId: string;
  userEmail: string;
  userName: string;
  userType: string;
  transactionType: string;
  amount: number;
  description: string;
  category: string;
  status: string;
  createdAt: string;
  metadata: any;
  referenceId?: string;
}

export function SystemTransactionHistory() {
  const [filters, setFilters] = useState({
    search: '',
    type: 'all',
    category: 'all',
    status: 'all'
  });

  const { data: transactions = [], isLoading, error, refetch } = useSystemTransactionHistory(filters);

  const exportTransactions = () => {
    if (transactions.length === 0) {
      toast.error('No transactions to export');
      return;
    }

    const csvData = transactions.map(tx => ({
      Date: new Date(tx.createdAt).toLocaleDateString(),
      User: tx.userName,
      Email: tx.userEmail,
      'User Type': tx.userType,
      Type: tx.transactionType,
      Amount: tx.amount,
      Category: tx.category,
      Status: tx.status,
      Description: tx.description
    }));

    const headers = Object.keys(csvData[0]);
    const csvContent = [
      headers.join(','),
      ...csvData.map(row => headers.map(header => `"${row[header as keyof typeof row]}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `transactions-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
    
    toast.success(`Exported ${transactions.length} transactions`);
  };

  const columns: ColumnDef<TransactionData>[] = [
    {
      accessorKey: "userName",
      header: "User",
      cell: ({ row }) => (
        <div className="flex flex-col min-w-[150px]">
          <span className="font-medium">{row.original.userName || 'Unknown User'}</span>
          <span className="text-sm text-muted-foreground">{row.original.userEmail}</span>
          <Badge variant="outline" className="w-fit mt-1 text-xs">
            {row.original.userType}
          </Badge>
        </div>
      ),
    },
    {
      accessorKey: "transactionType",
      header: "Type",
      cell: ({ row }) => {
        const type = row.getValue("transactionType") as string;
        const color = type === 'credit' ? 'bg-green-100 text-green-800' : 
                     type === 'debit' ? 'bg-red-100 text-red-800' : 
                     type === 'refund' ? 'bg-blue-100 text-blue-800' :
                     'bg-gray-100 text-gray-800';
        return <Badge className={color}>{type.toUpperCase()}</Badge>;
      },
    },
    {
      accessorKey: "amount",
      header: "Amount",
      cell: ({ row }) => {
        const amount = row.getValue("amount") as number;
        const type = row.original.transactionType;
        return (
          <div className={`font-semibold ${type === 'credit' || type === 'refund' ? 'text-green-600' : 'text-red-600'}`}>
            {type === 'credit' || type === 'refund' ? '+' : '-'}{amount.toLocaleString()}
          </div>
        );
      },
    },
    {
      accessorKey: "category",
      header: "Category",
      cell: ({ row }) => {
        const category = row.getValue("category") as string;
        return <Badge variant="outline">{category}</Badge>;
      },
    },
    {
      accessorKey: "description",
      header: "Description",
      cell: ({ row }) => (
        <div className="max-w-xs">
          <div className="truncate" title={row.getValue("description")}>
            {row.getValue("description")}
          </div>
          {row.original.referenceId && (
            <div className="text-xs text-muted-foreground mt-1">
              Ref: {row.original.referenceId.slice(0, 8)}...
            </div>
          )}
        </div>
      ),
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => {
        const status = row.getValue("status") as string;
        const color = status === 'completed' ? 'bg-green-100 text-green-800' : 
                     status === 'failed' ? 'bg-red-100 text-red-800' : 
                     'bg-yellow-100 text-yellow-800';
        return <Badge className={color}>{status.toUpperCase()}</Badge>;
      },
    },
    {
      accessorKey: "createdAt",
      header: "Time",
      cell: ({ row }) => (
        <div className="text-sm">
          <div className="font-medium">
            {formatDistanceToNow(new Date(row.getValue("createdAt")), { addSuffix: true })}
          </div>
          <div className="text-muted-foreground">
            {new Date(row.getValue("createdAt")).toLocaleDateString()}
          </div>
        </div>
      ),
    },
  ];

  if (error) {
    return (
      <div className="text-center py-8">
        <div className="text-red-600 mb-4">
          Error loading transaction history. Please try again.
        </div>
        <Button variant="outline" onClick={() => refetch()}>
          <RefreshCw className="h-4 w-4 mr-2" />
          Retry
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Enhanced Filters */}
      <div className="flex items-center gap-4 flex-wrap">
        <Input
          placeholder="Search transactions..."
          value={filters.search}
          onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
          className="max-w-sm"
        />
        
        <Select
          value={filters.type}
          onValueChange={(value) => setFilters(prev => ({ ...prev, type: value }))}
        >
          <SelectTrigger className="w-[150px]">
            <SelectValue placeholder="Type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="credit">Credit</SelectItem>
            <SelectItem value="debit">Debit</SelectItem>
            <SelectItem value="refund">Refund</SelectItem>
          </SelectContent>
        </Select>

        <Select
          value={filters.category}
          onValueChange={(value) => setFilters(prev => ({ ...prev, category: value }))}
        >
          <SelectTrigger className="w-[150px]">
            <SelectValue placeholder="Category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            <SelectItem value="bonus">Bonus</SelectItem>
            <SelectItem value="content">Content</SelectItem>
            <SelectItem value="session">Session</SelectItem>
            <SelectItem value="purchase">Purchase</SelectItem>
            <SelectItem value="adjustment">Adjustment</SelectItem>
            <SelectItem value="refund">Refund</SelectItem>
          </SelectContent>
        </Select>

        <Select
          value={filters.status}
          onValueChange={(value) => setFilters(prev => ({ ...prev, status: value }))}
        >
          <SelectTrigger className="w-[150px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="failed">Failed</SelectItem>
            <SelectItem value="cancelled">Cancelled</SelectItem>
          </SelectContent>
        </Select>

        <Button variant="outline" onClick={() => refetch()}>
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>

        <Button variant="outline" onClick={exportTransactions}>
          <Download className="h-4 w-4 mr-2" />
          Export ({transactions.length})
        </Button>
      </div>

      {/* Results Summary */}
      {!isLoading && (
        <div className="text-sm text-muted-foreground">
          Showing {transactions.length} transactions
          {filters.search && ` matching "${filters.search}"`}
          {(filters.type !== 'all' || filters.category !== 'all' || filters.status !== 'all') && 
            ` with active filters`}
        </div>
      )}

      {/* Enhanced Transaction Table */}
      <DataTable
        columns={columns}
        data={transactions}
        searchKey="userName"
        searchPlaceholder="Search transactions..."
        loading={isLoading}
      />
    </div>
  );
}
