
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Plus, ArrowRightLeft, Coins } from "lucide-react";
import { useAddTokensMutation } from "@/hooks/useAddTokensMutation";
import { useTokenTransferMutation } from "@/hooks/useTokenTransferMutation";
import { UserSearchInput } from "./UserSearchInput";
import { TokenOperationDialog } from "./TokenOperationDialog";
import { toast } from "sonner";

interface UserData {
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
  const [selectedUser, setSelectedUser] = useState<UserData | null>(null);
  const [sourceUser, setSourceUser] = useState<UserData | null>(null);
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<'bonus' | 'adjustment' | 'refund' | 'content'>('bonus');
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [operationType, setOperationType] = useState<'add' | 'transfer'>('add');

  const addTokensMutation = useAddTokensMutation();
  const transferTokensMutation = useTokenTransferMutation();

  const handleAddTokens = () => {
    if (!selectedUser || !amount || !description) {
      toast.error('Please fill in all required fields and select a user');
      return;
    }

    const tokenAmount = parseInt(amount);
    if (isNaN(tokenAmount) || tokenAmount <= 0) {
      toast.error('Please enter a valid amount');
      return;
    }

    setOperationType('add');
    setShowConfirmDialog(true);
  };

  const handleTransferTokens = () => {
    if (!sourceUser || !selectedUser || !amount || !description) {
      toast.error('Please fill in all required fields and select both users');
      return;
    }

    if (sourceUser.id === selectedUser.id) {
      toast.error('Cannot transfer tokens to the same user');
      return;
    }

    const tokenAmount = parseInt(amount);
    if (isNaN(tokenAmount) || tokenAmount <= 0) {
      toast.error('Please enter a valid amount');
      return;
    }

    if (sourceUser.currentBalance < tokenAmount) {
      toast.error('Source user has insufficient balance for this transfer');
      return;
    }

    setOperationType('transfer');
    setShowConfirmDialog(true);
  };

  const confirmOperation = async () => {
    const tokenAmount = parseInt(amount);

    try {
      if (operationType === 'add') {
        await addTokensMutation.mutateAsync({
          profileId: selectedUser!.id,
          amount: tokenAmount,
          description,
          category
        });
      } else {
        await transferTokensMutation.mutateAsync({
          fromProfileId: sourceUser!.id,
          toProfileId: selectedUser!.id,
          amount: tokenAmount,
          description
        });
      }

      // Reset form
      setSelectedUser(null);
      setSourceUser(null);
      setAmount('');
      setDescription('');
      setShowConfirmDialog(false);
    } catch (error) {
      console.error('Token operation failed:', error);
    }
  };

  const resetForm = () => {
    setSelectedUser(null);
    setSourceUser(null);
    setAmount('');
    setDescription('');
  };

  return (
    <div className="space-y-6">
      <Tabs defaultValue="add" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="add" className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
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
              <CardTitle className="flex items-center gap-2">
                <Coins className="h-5 w-5 text-green-600" />
                Add Tokens to User Account
              </CardTitle>
              <CardDescription>
                Add tokens to a user's wallet. This will create a credit transaction.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="target-user">Select User *</Label>
                <UserSearchInput
                  onUserSelect={setSelectedUser}
                  selectedUser={selectedUser}
                  onClearSelection={() => setSelectedUser(null)}
                  placeholder="Search for user to add tokens to..."
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="add-amount">Amount *</Label>
                  <Input
                    id="add-amount"
                    type="number"
                    placeholder="Enter amount"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    min="1"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="add-category">Category</Label>
                  <Select value={category} onValueChange={(value: any) => setCategory(value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="bonus">Bonus</SelectItem>
                      <SelectItem value="adjustment">Adjustment</SelectItem>
                      <SelectItem value="refund">Refund</SelectItem>
                      <SelectItem value="content">Content</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="add-description">Description *</Label>
                <Textarea
                  id="add-description"
                  placeholder="Enter reason for adding tokens..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                />
              </div>

              <div className="flex gap-3">
                <Button
                  onClick={handleAddTokens}
                  disabled={!selectedUser || !amount || !description || addTokensMutation.isPending}
                  className="flex-1"
                >
                  {addTokensMutation.isPending ? 'Adding...' : `Add ${amount || '0'} Tokens`}
                </Button>
                <Button variant="outline" onClick={resetForm}>
                  Reset
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="transfer" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ArrowRightLeft className="h-5 w-5 text-blue-600" />
                Transfer Tokens Between Users
              </CardTitle>
              <CardDescription>
                Transfer tokens from one user's wallet to another. Both debit and credit transactions will be created.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="source-user">From User *</Label>
                <UserSearchInput
                  onUserSelect={setSourceUser}
                  selectedUser={sourceUser}
                  onClearSelection={() => setSourceUser(null)}
                  placeholder="Search for user to transfer tokens from..."
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="target-user-transfer">To User *</Label>
                <UserSearchInput
                  onUserSelect={setSelectedUser}
                  selectedUser={selectedUser}
                  onClearSelection={() => setSelectedUser(null)}
                  placeholder="Search for user to transfer tokens to..."
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="transfer-amount">Amount *</Label>
                <Input
                  id="transfer-amount"
                  type="number"
                  placeholder="Enter amount to transfer"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  min="1"
                  max={sourceUser?.currentBalance || undefined}
                />
                {sourceUser && amount && parseInt(amount) > sourceUser.currentBalance && (
                  <p className="text-sm text-red-600">
                    Amount exceeds available balance ({sourceUser.currentBalance} tokens)
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="transfer-description">Description *</Label>
                <Textarea
                  id="transfer-description"
                  placeholder="Enter reason for token transfer..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                />
              </div>

              <div className="flex gap-3">
                <Button
                  onClick={handleTransferTokens}
                  disabled={
                    !sourceUser || 
                    !selectedUser || 
                    !amount || 
                    !description || 
                    transferTokensMutation.isPending ||
                    (sourceUser && parseInt(amount) > sourceUser.currentBalance)
                  }
                  className="flex-1"
                >
                  {transferTokensMutation.isPending ? 'Transferring...' : `Transfer ${amount || '0'} Tokens`}
                </Button>
                <Button variant="outline" onClick={resetForm}>
                  Reset
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <TokenOperationDialog
        isOpen={showConfirmDialog}
        onClose={() => setShowConfirmDialog(false)}
        onConfirm={confirmOperation}
        operationType={operationType}
        amount={parseInt(amount) || 0}
        user={selectedUser!}
        sourceUser={sourceUser}
        isLoading={addTokensMutation.isPending || transferTokensMutation.isPending}
      />
    </div>
  );
}
