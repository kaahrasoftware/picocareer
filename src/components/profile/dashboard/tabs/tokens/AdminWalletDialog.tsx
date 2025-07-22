
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Coins, TrendingUp, TrendingDown, Clock } from 'lucide-react';
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

interface AdminWalletDialogProps {
  wallet: WalletData;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AdminWalletDialog({ wallet, open, onOpenChange }: AdminWalletDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>
            Wallet Management: {wallet.firstName} {wallet.lastName}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* User Info */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">User Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Name</p>
                  <p className="font-medium">{wallet.firstName} {wallet.lastName}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Email</p>
                  <p className="font-medium">{wallet.email}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">User Type</p>
                  <Badge className={
                    wallet.userType === 'mentor' ? 'bg-blue-100 text-blue-800' :
                    wallet.userType === 'admin' ? 'bg-purple-100 text-purple-800' :
                    'bg-gray-100 text-gray-800'
                  }>
                    {wallet.userType}
                  </Badge>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Status</p>
                  <Badge className={wallet.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                    {wallet.isActive ? 'Active' : 'Inactive'}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Wallet Stats */}
          <div className="grid grid-cols-3 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <Coins className="h-4 w-4 text-blue-600" />
                  Current Balance
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-600">
                  {wallet.balance}
                </div>
                <p className="text-sm text-muted-foreground">tokens</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-green-600" />
                  Transactions
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">
                  {wallet.transactionCount}
                </div>
                <p className="text-sm text-muted-foreground">total</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <Clock className="h-4 w-4 text-orange-600" />
                  Last Activity
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-sm font-medium text-orange-600">
                  {wallet.lastActivity 
                    ? formatDistanceToNow(new Date(wallet.lastActivity), { addSuffix: true })
                    : 'Never'
                  }
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Quick Actions</CardTitle>
              <CardDescription>
                Perform common wallet operations
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-3">
                <Button variant="outline">
                  <Coins className="h-4 w-4 mr-2" />
                  Add Tokens
                </Button>
                <Button variant="outline">
                  <TrendingDown className="h-4 w-4 mr-2" />
                  Deduct Tokens
                </Button>
                <Button variant="outline" className="col-span-2">
                  View Transaction History
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
}
