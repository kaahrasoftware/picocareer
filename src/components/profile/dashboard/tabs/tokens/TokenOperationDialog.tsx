
import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { AlertTriangle, CheckCircle, User, Coins } from "lucide-react";

interface UserData {
  id: string;
  email: string;
  fullName: string;
  currentBalance: number;
  firstName?: string;
  lastName?: string;
  userType?: string;
}

interface TokenOperationDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  operationType: 'add' | 'transfer';
  amount: number;
  user: UserData | null;
  sourceUser?: UserData | null;
  isLoading?: boolean;
}

export function TokenOperationDialog({
  isOpen,
  onClose,
  onConfirm,
  operationType,
  amount,
  user,
  sourceUser,
  isLoading = false
}: TokenOperationDialogProps) {
  const isTransfer = operationType === 'transfer';
  
  // Don't render dialog if user data is missing
  if (!user) {
    return null;
  }

  // Safely get user display name with fallbacks
  const getUserDisplayName = (userData: UserData | null) => {
    if (!userData) return 'Unknown User';
    return userData.fullName || 
           `${userData.firstName || ''} ${userData.lastName || ''}`.trim() || 
           userData.email?.split('@')[0] || 
           'Unknown User';
  };

  const getUserEmail = (userData: UserData | null) => {
    return userData?.email || 'No email';
  };

  const getUserBalance = (userData: UserData | null) => {
    return userData?.currentBalance || 0;
  };

  const displayName = getUserDisplayName(user);
  const sourceDisplayName = getUserDisplayName(sourceUser);
  
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {isTransfer ? <AlertTriangle className="h-5 w-5 text-orange-500" /> : <CheckCircle className="h-5 w-5 text-green-500" />}
            Confirm Token {isTransfer ? 'Transfer' : 'Addition'}
          </DialogTitle>
          <DialogDescription>
            Please review the details below and confirm this operation.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {isTransfer && sourceUser && (
            <div className="p-4 bg-orange-50 rounded-lg border border-orange-200">
              <h4 className="font-medium text-orange-800 mb-2">From User</h4>
              <div className="flex items-center gap-2 text-sm">
                <User className="h-4 w-4 text-orange-600" />
                <span className="font-medium">{sourceDisplayName}</span>
                <span className="text-orange-600">({getUserEmail(sourceUser)})</span>
              </div>
              <div className="flex items-center gap-1 text-sm mt-1">
                <Coins className="h-3 w-3 text-orange-600" />
                <span>Current: {getUserBalance(sourceUser)} tokens</span>
                <span className="text-orange-600">→ Will have: {getUserBalance(sourceUser) - amount} tokens</span>
              </div>
            </div>
          )}

          <div className="p-4 bg-green-50 rounded-lg border border-green-200">
            <h4 className="font-medium text-green-800 mb-2">
              {isTransfer ? 'To User' : 'Target User'}
            </h4>
            <div className="flex items-center gap-2 text-sm">
              <User className="h-4 w-4 text-green-600" />
              <span className="font-medium">{displayName}</span>
              <span className="text-green-600">({getUserEmail(user)})</span>
            </div>
            <div className="flex items-center gap-1 text-sm mt-1">
              <Coins className="h-3 w-3 text-green-600" />
              <span>Current: {getUserBalance(user)} tokens</span>
              <span className="text-green-600">→ Will have: {getUserBalance(user) + amount} tokens</span>
            </div>
          </div>

          <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
            <h4 className="font-medium text-blue-800 mb-2">Operation Summary</h4>
            <div className="text-sm space-y-1">
              <div className="flex justify-between">
                <span>Amount:</span>
                <span className="font-medium">{amount} tokens</span>
              </div>
              <div className="flex justify-between">
                <span>Operation:</span>
                <span className="font-medium capitalize">{operationType}</span>
              </div>
              {isTransfer && sourceUser && getUserBalance(sourceUser) < amount && (
                <div className="text-red-600 text-xs mt-2 font-medium">
                  ⚠️ Warning: Source user has insufficient balance!
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="flex gap-3 pt-4">
          <Button variant="outline" onClick={onClose} className="flex-1">
            Cancel
          </Button>
          <Button 
            onClick={onConfirm} 
            disabled={isLoading || (isTransfer && sourceUser && getUserBalance(sourceUser) < amount)}
            className="flex-1"
          >
            {isLoading ? 'Processing...' : `Confirm ${operationType === 'transfer' ? 'Transfer' : 'Add Tokens'}`}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
