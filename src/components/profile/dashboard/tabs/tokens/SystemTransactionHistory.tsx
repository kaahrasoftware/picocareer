
import React, { useState } from 'react';
import { DataTable } from "@/components/ui/data-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ColumnDef } from "@tanstack/react-table";
import { formatDistanceToNow } from 'date-fns';
import { Download, Filter } from "lucide-react";
import { useSystemTransactionHistory } from '@/hooks/useSystemTransactionHistory';

interface TransactionData {
  id: string;
  walletId: string;
  userEmail: string;
  userName: string;
  transactionType: string;
  amount: number;
  description: string;
  category: string;
  status: string;
  createdAt: string;
  metadata: any;
}

export function SystemTransactionHistory() {
  const [filters, setFilters] = useState({
    search: '',
    type: 'all',
    category: 'all',
    status: 'all'
  });

  const { data: transactions = [], isLoading, error } = useSystemTransactionHistory(filters);

  const columns: ColumnDef<TransactionData>[] = [
    {
      accessorKey: "userName",
      header: "User",
      cell: ({ row }) => (
        <div className="flex flex-col">
          <span className="font-medium">{row.original.userName}</span>
          <span className="text-sm text-muted-foreground">{row.original.userEmail}</span>
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
        return <Badge className={color}>{type}</Badge>;
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
            {type === 'credit' || type === 'refund' ? '+' : '-'}{amount}
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
        <div className="max-w-xs truncate" title={row.getValue("description")}>
          {row.getValue("description")}
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
        return <Badge className={color}>{status}</Badge>;
      },
    },
    {
      accessorKey: "createdAt",
      header: "Time",
      cell: ({ row }) => (
        <span className="text-sm text-muted-foreground">
          {formatDistanceToNow(new Date(row.getValue("createdAt")), { addSuffix: true })}
        </span>
      ),
    },
  ];

  if (error) {
    return (
      <div className="text-center py-8 text-red-600">
        Error loading transaction history. Please try again.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Filters */}
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
            <SelectItem value="adjustment">Adjustment</SelectItem>
          </SelectContent>
        </Select>

        <Button variant="outline">
          <Download className="h-4 w-4 mr-2" />
          Export
        </Button>
      </div>

      {/* Transaction Table */}
      <DataTable
        columns={columns}
        data={transactions}
        searchKey="userName"
        searchPlaceholder="Search transactions..."
      />
    </div>
  );
}
