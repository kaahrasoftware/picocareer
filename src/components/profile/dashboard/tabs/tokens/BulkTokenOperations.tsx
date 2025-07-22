
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Coins, Users } from 'lucide-react';
import { toast } from "sonner";

interface BulkTokenOperationsProps {
  selectedWalletIds: string[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onComplete: () => void;
}

export function BulkTokenOperations({ 
  selectedWalletIds, 
  open, 
  onOpenChange, 
  onComplete 
}: BulkTokenOperationsProps) {
  const [operation, setOperation] = useState('add');
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('bonus');
  const [isProcessing, setIsProcessing] = useState(false);

  const handleBulkOperation = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!amount || !description) {
      toast.error('Please fill in all required fields');
      return;
    }

    setIsProcessing(true);
    
    try {
      // This would typically call a bulk operation endpoint
      // For now, we'll simulate the operation
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      toast.success(`${operation === 'add' ? 'Added' : 'Deducted'} ${amount} tokens ${operation === 'add' ? 'to' : 'from'} ${selectedWalletIds.length} users`);
      onComplete();
    } catch (error) {
      toast.error('Failed to process bulk operation');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Bulk Token Operations</DialogTitle>
        </DialogHeader>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Selected Users
            </CardTitle>
            <CardDescription>
              Operation will be applied to {selectedWalletIds.length} selected users
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Badge variant="outline" className="text-lg px-3 py-1">
              {selectedWalletIds.length} users selected
            </Badge>
          </CardContent>
        </Card>

        <form onSubmit={handleBulkOperation} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="operation">Operation</Label>
            <Select value={operation} onValueChange={setOperation}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="add">Add Tokens</SelectItem>
                <SelectItem value="deduct">Deduct Tokens</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="amount">Amount per User</Label>
            <Input
              id="amount"
              type="number"
              min="1"
              placeholder="Enter token amount"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              required
            />
          </div>

          {operation === 'add' && (
            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <Select value={category} onValueChange={setCategory}>
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
          )}

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              placeholder="Reason for this bulk operation..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
            />
          </div>

          <div className="bg-muted p-4 rounded-lg">
            <div className="flex items-center gap-2 text-sm">
              <Coins className="h-4 w-4" />
              <span className="font-medium">Total Impact:</span>
              <span>
                {operation === 'add' ? '+' : '-'}{amount ? (parseInt(amount) * selectedWalletIds.length).toLocaleString() : '0'} tokens
              </span>
            </div>
          </div>

          <div className="flex gap-3">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => onOpenChange(false)}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={isProcessing}
              className="flex-1"
            >
              {isProcessing ? 'Processing...' : `${operation === 'add' ? 'Add' : 'Deduct'} Tokens`}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
