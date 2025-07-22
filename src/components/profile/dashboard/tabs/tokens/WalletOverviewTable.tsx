
import React, { useState } from 'react';
import { DataTable } from "@/components/ui/data-table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { ColumnDef } from "@tanstack/react-table";
import { Edit, Search, Download, Plus } from "lucide-react";
import { useAdminWalletManagement } from '@/hooks/useAdminWalletManagement';
import { AdminWalletDialog } from './AdminWalletDialog';
import { BulkTokenOperations } from './BulkTokenOperations';
import { formatDistanceToNow } from 'date-fns';

interface WalletData {
  id: string;
  profileId: string;
  firstName: string;
  lastName: string;
  email: string;
  userType: string;
  balance: number;
  transactionCount: number;
  lastActivity: string | null;
  isActive: boolean;
}

export function WalletOverviewTable() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedWallets, setSelectedWallets] = useState<string[]>([]);
  const [selectedWallet, setSelectedWallet] = useState<WalletData | null>(null);
  const [showBulkOperations, setShowBulkOperations] = useState(false);

  const { data: wallets = [], isLoading, error } = useAdminWalletManagement(searchTerm);

  const columns: ColumnDef<WalletData>[] = [
    {
      id: "select",
      header: ({ table }) => (
        <Checkbox
          checked={table.getIsAllPageRowsSelected()}
          onCheckedChange={(value) => {
            table.toggleAllPageRowsSelected(!!value);
            if (value) {
              setSelectedWallets(wallets.map(w => w.id));
            } else {
              setSelectedWallets([]);
            }
          }}
          aria-label="Select all"
        />
      ),
      cell: ({ row }) => (
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(value) => {
            row.toggleSelected(!!value);
            const walletId = row.original.id;
            if (value) {
              setSelectedWallets(prev => [...prev, walletId]);
            } else {
              setSelectedWallets(prev => prev.filter(id => id !== walletId));
            }
          }}
          aria-label="Select row"
        />
      ),
      enableSorting: false,
      enableHiding: false,
    },
    {
      accessorKey: "firstName",
      header: "User",
      cell: ({ row }) => (
        <div className="flex flex-col">
          <span className="font-medium">
            {row.original.firstName} {row.original.lastName}
          </span>
          <span className="text-sm text-muted-foreground">
            {row.original.email}
          </span>
        </div>
      ),
    },
    {
      accessorKey: "userType",
      header: "Type",
      cell: ({ row }) => {
        const type = row.getValue("userType") as string;
        const color = type === 'mentor' ? 'bg-blue-100 text-blue-800' : 
                     type === 'admin' ? 'bg-purple-100 text-purple-800' : 
                     'bg-gray-100 text-gray-800';
        return <Badge className={color}>{type}</Badge>;
      },
    },
    {
      accessorKey: "balance",
      header: "Balance",
      cell: ({ row }) => (
        <div className="flex items-center gap-1 font-semibold">
          <span>{row.getValue("balance")}</span>
          <span className="text-sm text-muted-foreground">tokens</span>
        </div>
      ),
    },
    {
      accessorKey: "transactionCount",
      header: "Transactions",
      cell: ({ row }) => (
        <span className="text-sm">{row.getValue("transactionCount")}</span>
      ),
    },
    {
      accessorKey: "lastActivity",
      header: "Last Activity",
      cell: ({ row }) => {
        const lastActivity = row.getValue("lastActivity") as string | null;
        return (
          <span className="text-sm text-muted-foreground">
            {lastActivity ? formatDistanceToNow(new Date(lastActivity), { addSuffix: true }) : 'Never'}
          </span>
        );
      },
    },
    {
      accessorKey: "isActive",
      header: "Status",
      cell: ({ row }) => {
        const isActive = row.getValue("isActive") as boolean;
        return (
          <Badge className={isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
            {isActive ? 'Active' : 'Inactive'}
          </Badge>
        );
      },
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => (
        <Button
          variant="outline"
          size="sm"
          onClick={() => setSelectedWallet(row.original)}
        >
          <Edit className="h-4 w-4" />
        </Button>
      ),
    },
  ];

  if (error) {
    return (
      <div className="text-center py-8 text-red-600">
        Error loading wallet data. Please try again.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Search and Actions Bar */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search users..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-8"
          />
        </div>
        
        <Button
          variant="outline"
          onClick={() => setShowBulkOperations(true)}
          disabled={selectedWallets.length === 0}
        >
          <Plus className="h-4 w-4 mr-2" />
          Bulk Operations ({selectedWallets.length})
        </Button>
        
        <Button variant="outline">
          <Download className="h-4 w-4 mr-2" />
          Export
        </Button>
      </div>

      {/* Data Table */}
      <DataTable
        columns={columns}
        data={wallets}
        searchKey="firstName"
        searchPlaceholder="Search users..."
      />

      {/* Wallet Detail Dialog */}
      {selectedWallet && (
        <AdminWalletDialog
          wallet={selectedWallet}
          open={!!selectedWallet}
          onOpenChange={() => setSelectedWallet(null)}
        />
      )}

      {/* Bulk Operations Dialog */}
      {showBulkOperations && (
        <BulkTokenOperations
          selectedWalletIds={selectedWallets}
          open={showBulkOperations}
          onOpenChange={setShowBulkOperations}
          onComplete={() => {
            setSelectedWallets([]);
            setShowBulkOperations(false);
          }}
        />
      )}
    </div>
  );
}
