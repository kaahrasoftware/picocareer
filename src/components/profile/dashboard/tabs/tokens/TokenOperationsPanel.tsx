
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { UserPlus, ArrowRightLeft, AlertTriangle } from "lucide-react";
import { UserSearchInput } from './UserSearchInput';
import { TokenOperationDialog } from './TokenOperationDialog';
import { useAddTokensMutation } from '@/hooks/useAddTokensMutation';
import { useTokenTransferMutation } from '@/hooks/useTokenTransferMutation';
import { toast } from 'sonner';

interface UserSearchResult {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  fullName: string;
  userType: string;
  currentBalance: number;
  walletId?: string;
}

export function TokenOperationsPanel() {
  const [activeTab, setActiveTab] = useState('add');
  
  // Add tokens state
  const [addUser, setAddUser] = useState<UserSearchResult | null>(null);
  const [addAmount, setAddAmount] = useState('');
  const [addDescription, setAddDescription] = useState('');
  const [addCategory, setAddCategory] = useState('adjustment');
  const [showAddConfirm, setShowAddConfirm] = useState(false);
  
  // Transfer tokens state
  const [fromUser, setFromUser] = useState<UserSearchResult | null>(null);
  const [toUser, setToUser] = useState<UserSearchResult | null>(null);
  const [transferAmount, setTransferAmount] = useState('');
  const [transferDescription, setTransferDescription] = useState('');
  const [showTransferConfirm, setShowTransferConfirm] = useState(false);

  const addTokensMutation = useAddTokensMutation();
  const transferTokensMutation = useTokenTransferMutation();

  const handleAddTokens = () => {
    if (!addUser) {
      toast.error('Please select a user');
      return;
    }
    
    const amount = parseFloat(addAmount);
    if (!amount || amount <= 0) {
      toast.error('Please enter a valid amount');
      return;
    }

    setShowAddConfirm(true);
  };

  const confirmAddTokens = () => {
    if (!addUser) return;
    
    const amount = parseFloat(addAmount);
    addTokensMutation.mutate({
      profileId: addUser.id,
      amount,
      description: addDescription || `Admin added ${amount} tokens`,
      category: addCategory as 'bonus' | 'adjustment' | 'refund' | 'content'
    }, {
      onSuccess: () => {
        setShowAddConfirm(false);
        setAddUser(null);
        setAddAmount('');
        setAddDescription('');
        setAddCategory('adjustment');
      }
    });
  };

  const handleTransferTokens = () => {
    if (!fromUser) {
      toast.error('Please select a source user');
      return;
    }
    
    if (!toUser) {
      toast.error('Please select a destination user');
      return;
    }
    
    const amount = parseFloat(transferAmount);
    if (!amount || amount <= 0) {
      toast.error('Please enter a valid amount');
      return;
    }

    if (fromUser.currentBalance < amount) {
      toast.error('Source user has insufficient balance');
      return;
    }

    setShowTransferConfirm(true);
  };

  const confirmTransferTokens = () => {
    if (!fromUser || !toUser) return;
    
    const amount = parseFloat(transferAmount);
    transferTokensMutation.mutate({
      fromProfileId: fromUser.id,
      toProfileId: toUser.id,
      amount,
      description: transferDescription || `Admin transfer: ${amount} tokens from ${fromUser.fullName} to ${toUser.fullName}`
    }, {
      onSuccess: () => {
        setShowTransferConfirm(false);
        setFromUser(null);
        setToUser(null);
        setTransferAmount('');
        setTransferDescription('');
      }
    });
  };

  return (
    <div className="space-y-6">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="add" className="flex items-center gap-2">
            <UserPlus className="h-4 w-4" />
            Add Tokens
          </TabsTrigger>
          <TabsTrigger value="transfer" className="flex items-center gap-2">
            <ArrowRightLeft className="h-4 w-4" />
            Transfer Tokens
          </TabsTrigger>
        </TabsList>

        <TabsContent value="add" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Add Tokens to User</CardTitle>
              <CardDescription>
                Add tokens to a user's wallet. This creates a positive transaction in their account.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Select User</Label>
                <UserSearchInput
                  onUserSelect={setAddUser}
                  selectedUser={addUser}
                  onClearSelection={() => setAddUser(null)}
                  placeholder="Search for user to add tokens to..."
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="add-amount">Amount</Label>
                  <Input
                    id="add-amount"
                    type="number"
                    value={addAmount}
                    onChange={(e) => setAddAmount(e.target.value)}
                    placeholder="Enter token amount"
                    min="1"
                    step="1"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="add-category">Category</Label>
                  <Select value={addCategory} onValueChange={setAddCategory}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="content">Content</SelectItem>
                      <SelectItem value="bonus">Bonus</SelectItem>
                      <SelectItem value="adjustment">Adjustment</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="add-description">Description (Optional)</Label>
                <Textarea
                  id="add-description"
                  value={addDescription}
                  onChange={(e) => setAddDescription(e.target.value)}
                  placeholder="Reason for adding tokens..."
                  rows={3}
                />
              </div>

              <Button 
                onClick={handleAddTokens}
                disabled={!addUser || !addAmount || addTokensMutation.isPending}
                className="w-full"
              >
                {addTokensMutation.isPending ? 'Adding...' : 'Add Tokens'}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="transfer" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Transfer Tokens Between Users</CardTitle>
              <CardDescription>
                Transfer tokens from one user's wallet to another. Both users must exist and have wallets.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>From User (Source)</Label>
                <UserSearchInput
                  onUserSelect={setFromUser}
                  selectedUser={fromUser}
                  onClearSelection={() => setFromUser(null)}
                  placeholder="Search for source user..."
                />
              </div>

              <div className="space-y-2">
                <Label>To User (Destination)</Label>
                <UserSearchInput
                  onUserSelect={setToUser}
                  selectedUser={toUser}
                  onClearSelection={() => setToUser(null)}
                  placeholder="Search for destination user..."
                />
              </div>

              {fromUser && toUser && fromUser.id === toUser.id && (
                <div className="flex items-center gap-2 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <AlertTriangle className="h-4 w-4 text-yellow-600" />
                  <span className="text-sm text-yellow-800">
                    Source and destination users cannot be the same
                  </span>
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="transfer-amount">Amount</Label>
                <Input
                  id="transfer-amount"
                  type="number"
                  value={transferAmount}
                  onChange={(e) => setTransferAmount(e.target.value)}
                  placeholder="Enter token amount"
                  min="1"
                  step="1"
                />
                {fromUser && transferAmount && parseFloat(transferAmount) > fromUser.currentBalance && (
                  <p className="text-sm text-red-600">
                    Amount exceeds source user's balance ({fromUser.currentBalance} tokens)
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="transfer-description">Description (Optional)</Label>
                <Textarea
                  id="transfer-description"
                  value={transferDescription}
                  onChange={(e) => setTransferDescription(e.target.value)}
                  placeholder="Reason for transfer..."
                  rows={3}
                />
              </div>

              <Button 
                onClick={handleTransferTokens}
                disabled={
                  !fromUser || 
                  !toUser || 
                  !transferAmount || 
                  fromUser.id === toUser.id ||
                  (transferAmount && parseFloat(transferAmount) > fromUser.currentBalance) ||
                  transferTokensMutation.isPending
                }
                className="w-full"
              >
                {transferTokensMutation.isPending ? 'Transferring...' : 'Transfer Tokens'}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Add Tokens Confirmation Dialog */}
      <TokenOperationDialog
        isOpen={showAddConfirm}
        onClose={() => setShowAddConfirm(false)}
        onConfirm={confirmAddTokens}
        operationType="add"
        amount={parseFloat(addAmount) || 0}
        user={addUser}
        isLoading={addTokensMutation.isPending}
      />

      {/* Transfer Tokens Confirmation Dialog */}
      <TokenOperationDialog
        isOpen={showTransferConfirm}
        onClose={() => setShowTransferConfirm(false)}
        onConfirm={confirmTransferTokens}
        operationType="transfer"
        amount={parseFloat(transferAmount) || 0}
        user={toUser}
        sourceUser={fromUser}
        isLoading={transferTokensMutation.isPending}
      />
    </div>
  );
}
