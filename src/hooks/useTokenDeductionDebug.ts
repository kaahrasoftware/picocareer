
import { useState } from 'react';
import { useTokenOperations } from './useTokenOperations';
import { useWalletBalance } from './useWalletBalance';
import { toast } from 'sonner';

interface DeductionDebugResult {
  step: string;
  success: boolean;
  data?: any;
  error?: string;
  timestamp: string;
}

export function useTokenDeductionDebug() {
  const [debugLog, setDebugLog] = useState<DeductionDebugResult[]>([]);
  const [isDebugging, setIsDebugging] = useState(false);
  const { deductTokens } = useTokenOperations();
  const { wallet, balance, refreshBalance } = useWalletBalance();

  const addDebugEntry = (step: string, success: boolean, data?: any, error?: string) => {
    const entry: DeductionDebugResult = {
      step,
      success,
      data,
      error,
      timestamp: new Date().toISOString()
    };
    console.log(`[TOKEN DEBUG] ${step}:`, { success, data, error });
    setDebugLog(prev => [...prev, entry]);
    return entry;
  };

  const debugTokenDeduction = async (amount: number = 25) => {
    setIsDebugging(true);
    setDebugLog([]);
    
    try {
      // Step 1: Check user authentication
      addDebugEntry('User Authentication Check', true, { 
        hasWallet: !!wallet,
        walletId: wallet?.id,
        currentBalance: balance
      });

      if (!wallet) {
        addDebugEntry('Wallet Validation', false, null, 'No wallet found for user');
        toast.error('No wallet found. Please refresh the page and try again.');
        return false;
      }

      // Step 2: Validate wallet balance
      if (balance < amount) {
        addDebugEntry('Balance Validation', false, { 
          required: amount, 
          available: balance 
        }, `Insufficient balance: need ${amount}, have ${balance}`);
        toast.error(`Insufficient tokens. You need ${amount} tokens but only have ${balance}.`);
        return false;
      }

      addDebugEntry('Balance Validation', true, { 
        required: amount, 
        available: balance,
        walletId: wallet.id
      });

      // Step 3: Attempt token deduction
      addDebugEntry('Token Deduction Start', true, {
        walletId: wallet.id,
        amount,
        description: `Debug test deduction`,
        category: 'session'
      });

      const deductionResult = await deductTokens.mutateAsync({
        walletId: wallet.id,
        amount,
        description: `Debug test deduction of ${amount} tokens`,
        category: 'session',
        metadata: {
          debug_test: true,
          original_balance: balance,
          timestamp: new Date().toISOString()
        }
      });

      if (deductionResult.success) {
        addDebugEntry('Token Deduction Success', true, {
          transactionId: deductionResult.transaction_id,
          newBalance: deductionResult.new_balance
        });
        
        // Step 4: Refresh wallet balance
        await refreshBalance();
        addDebugEntry('Balance Refresh', true);
        
        toast.success(`Successfully deducted ${amount} tokens! Transaction ID: ${deductionResult.transaction_id}`);
        return true;
      } else {
        addDebugEntry('Token Deduction Failed', false, deductionResult, deductionResult.message);
        toast.error(`Token deduction failed: ${deductionResult.message}`);
        return false;
      }

    } catch (error: any) {
      console.error('Token deduction debug error:', error);
      addDebugEntry('Unexpected Error', false, null, error.message);
      toast.error(`Unexpected error during token deduction: ${error.message}`);
      return false;
    } finally {
      setIsDebugging(false);
    }
  };

  const clearDebugLog = () => {
    setDebugLog([]);
  };

  return {
    debugTokenDeduction,
    debugLog,
    isDebugging,
    clearDebugLog,
    wallet,
    balance
  };
}
