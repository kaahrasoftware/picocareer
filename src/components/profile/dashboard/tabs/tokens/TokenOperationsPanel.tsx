
import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Coins, ArrowRightLeft, Settings, Gift } from "lucide-react";
import { useTokenTransferMutation } from '@/hooks/useTokenTransferMutation';
import { useAddTokensMutation } from '@/hooks/useAddTokensMutation';
import { toast } from "sonner";

export function TokenOperationsPanel() {
  const [activeOperation, setActiveOperation] = useState('add');
  const addTokensMutation = useAddTokensMutation();
  const transferMutation = useTokenTransferMutation();

  // Add Tokens Form State
  const [addForm, setAddForm] = useState({
    userId: '',
    amount: '',
    description: '',
    category: 'bonus'
  });

  // Transfer Tokens Form State
  const [transferForm, setTransferForm] = useState({
    fromUserId: '',
    toUserId: '',
    amount: '',
    description: ''
  });

  const handleAddTokens = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!addForm.userId || !addForm.amount || !addForm.description) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      await addTokensMutation.mutateAsync({
        profileId: addForm.userId,
        amount: parseInt(addForm.amount),
        description: addForm.description,
        category: addForm.category as any
      });

      setAddForm({ userId: '', amount: '', description: '', category: 'bonus' });
      toast.success('Tokens added successfully');
    } catch (error) {
      toast.error('Failed to add tokens');
    }
  };

  const handleTransferTokens = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!transferForm.fromUserId || !transferForm.toUserId || !transferForm.amount) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      await transferMutation.mutateAsync({
        fromProfileId: transferForm.fromUserId,
        toProfileId: transferForm.toUserId,
        amount: parseInt(transferForm.amount),
        description: transferForm.description || 'Admin transfer'
      });

      setTransferForm({ fromUserId: '', toUserId: '', amount: '', description: '' });
      toast.success('Tokens transferred successfully');
    } catch (error) {
      toast.error('Failed to transfer tokens');
    }
  };

  return (
    <div className="space-y-6">
      <Tabs value={activeOperation} onValueChange={setActiveOperation}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="add" className="flex items-center gap-2">
            <Coins className="h-4 w-4" />
            Add Tokens
          </TabsTrigger>
          <TabsTrigger value="transfer" className="flex items-center gap-2">
            <ArrowRightLeft className="h-4 w-4" />
            Transfer
          </TabsTrigger>
          <TabsTrigger value="adjust" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            Adjust
          </TabsTrigger>
          <TabsTrigger value="promotional" className="flex items-center gap-2">
            <Gift className="h-4 w-4" />
            Promotional
          </TabsTrigger>
        </TabsList>

        <TabsContent value="add">
          <Card>
            <CardHeader>
              <CardTitle>Add Tokens to User</CardTitle>
              <CardDescription>
                Credit tokens to a specific user account
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleAddTokens} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="userId">User ID or Email</Label>
                  <Input
                    id="userId"
                    placeholder="Enter user ID or email"
                    value={addForm.userId}
                    onChange={(e) => setAddForm(prev => ({ ...prev, userId: e.target.value }))}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="amount">Amount</Label>
                  <Input
                    id="amount"
                    type="number"
                    min="1"
                    placeholder="Enter token amount"
                    value={addForm.amount}
                    onChange={(e) => setAddForm(prev => ({ ...prev, amount: e.target.value }))}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="category">Category</Label>
                  <Select
                    value={addForm.category}
                    onValueChange={(value) => setAddForm(prev => ({ ...prev, category: value }))}
                  >
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

                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    placeholder="Reason for adding tokens..."
                    value={addForm.description}
                    onChange={(e) => setAddForm(prev => ({ ...prev, description: e.target.value }))}
                    required
                  />
                </div>

                <Button 
                  type="submit" 
                  className="w-full"
                  disabled={addTokensMutation.isPending}
                >
                  {addTokensMutation.isPending ? 'Adding...' : 'Add Tokens'}
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="transfer">
          <Card>
            <CardHeader>
              <CardTitle>Transfer Tokens Between Users</CardTitle>
              <CardDescription>
                Move tokens from one user account to another
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleTransferTokens} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="fromUser">From User</Label>
                    <Input
                      id="fromUser"
                      placeholder="User ID or email"
                      value={transferForm.fromUserId}
                      onChange={(e) => setTransferForm(prev => ({ ...prev, fromUserId: e.target.value }))}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="toUser">To User</Label>
                    <Input
                      id="toUser"
                      placeholder="User ID or email"
                      value={transferForm.toUserId}
                      onChange={(e) => setTransferForm(prev => ({ ...prev, toUserId: e.target.value }))}
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="transferAmount">Amount</Label>
                  <Input
                    id="transferAmount"
                    type="number"
                    min="1"
                    placeholder="Enter token amount"
                    value={transferForm.amount}
                    onChange={(e) => setTransferForm(prev => ({ ...prev, amount: e.target.value }))}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="transferDescription">Description (Optional)</Label>
                  <Textarea
                    id="transferDescription"
                    placeholder="Reason for transfer..."
                    value={transferForm.description}
                    onChange={(e) => setTransferForm(prev => ({ ...prev, description: e.target.value }))}
                  />
                </div>

                <Button 
                  type="submit" 
                  className="w-full"
                  disabled={transferMutation.isPending}
                >
                  {transferMutation.isPending ? 'Transferring...' : 'Transfer Tokens'}
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="adjust">
          <Card>
            <CardHeader>
              <CardTitle>Balance Adjustments</CardTitle>
              <CardDescription>
                Make corrections or adjustments to user balances
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-muted-foreground">
                Balance adjustment functionality coming soon...
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="promotional">
          <Card>
            <CardHeader>
              <CardTitle>Promotional Campaigns</CardTitle>
              <CardDescription>
                Create and manage token promotional campaigns
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-muted-foreground">
                Promotional campaign tools coming soon...
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
