
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useWalletBalance } from "@/hooks/useWalletBalance";
import { useTokenOperations } from "@/hooks/useTokenOperations";
import { useAuthSession } from "@/hooks/useAuthSession";
import { useState } from "react";
import { BookingFormDebug } from "@/components/booking/BookingFormDebug";
import { toast } from "sonner";
import { Coins, User, TestTube } from "lucide-react";

export default function TokenDeductionDebug() {
  const { session } = useAuthSession();
  const { wallet, balance, refreshBalance } = useWalletBalance();
  const { deductTokens, refundTokens } = useTokenOperations();
  const [isDeducting, setIsDeducting] = useState(false);
  const [formData, setFormData] = useState<any>({});

  const handleDirectDeduction = async () => {
    if (!wallet) {
      toast.error('No wallet found for user');
      return;
    }

    setIsDeducting(true);
    try {
      console.log('🧪 Starting direct token deduction test...');
      console.log('Wallet:', wallet);
      console.log('Current balance:', balance);
      
      const result = await deductTokens.mutateAsync({
        walletId: wallet.id,
        amount: 5,
        description: 'Debug test deduction',
        category: 'content',
        metadata: {
          test: true,
          timestamp: new Date().toISOString()
        }
      });

      console.log('✅ Deduction result:', result);
      
      if (result.success) {
        toast.success(`Successfully deducted 5 tokens. New balance: ${result.new_balance}`);
        refreshBalance();
      } else {
        toast.error(`Deduction failed: ${result.message}`);
      }
    } catch (error: any) {
      console.error('❌ Deduction error:', error);
      toast.error(`Error: ${error.message}`);
    } finally {
      setIsDeducting(false);
    }
  };

  const handleRefund = async () => {
    if (!wallet) {
      toast.error('No wallet found for user');
      return;
    }

    try {
      console.log('🔄 Starting refund test...');
      
      const result = await refundTokens.mutateAsync({
        walletId: wallet.id,
        amount: 5,
        description: 'Debug test refund',
        metadata: {
          test: true,
          timestamp: new Date().toISOString()
        }
      });

      console.log('✅ Refund result:', result);
      
      if (result.success) {
        toast.success(`Successfully refunded 5 tokens. New balance: ${result.new_balance}`);
        refreshBalance();
      } else {
        toast.error(`Refund failed: ${result.message}`);
      }
    } catch (error: any) {
      console.error('❌ Refund error:', error);
      toast.error(`Error: ${error.message}`);
    }
  };

  if (!session) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 p-8">
        <div className="max-w-4xl mx-auto">
          <Card>
            <CardContent className="p-8 text-center">
              <p className="text-lg">Please log in to test token deduction</p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 p-8">
      <div className="max-w-6xl mx-auto space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold mb-2 flex items-center justify-center gap-2">
            <TestTube className="h-8 w-8 text-primary" />
            Token Deduction Debug Center
          </h1>
          <p className="text-muted-foreground">
            Comprehensive debugging and testing for the token deduction system
          </p>
        </div>

        {/* User & Wallet Info */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Current User & Wallet Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">User ID</p>
                <p className="font-mono text-sm">{session.user?.id}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Wallet ID</p>
                <p className="font-mono text-sm">{wallet?.id || 'Not found'}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Current Balance</p>
                <p className="font-semibold flex items-center gap-1">
                  <Coins className="h-4 w-4 text-primary" />
                  {balance} tokens
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Profile ID</p>
                <p className="font-mono text-sm">{wallet?.profile_id || 'N/A'}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Direct Token Operations */}
        <Card>
          <CardHeader>
            <CardTitle>Direct Token Operations</CardTitle>
            <CardDescription>
              Test token deduction and refund operations directly
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-4">
              <Button 
                onClick={handleDirectDeduction}
                disabled={isDeducting || !wallet}
                className="flex-1"
              >
                {isDeducting ? 'Deducting...' : 'Test Deduct 5 Tokens'}
              </Button>
              <Button 
                onClick={handleRefund}
                variant="outline"
                disabled={!wallet}
                className="flex-1"
              >
                Test Refund 5 Tokens
              </Button>
              <Button 
                onClick={refreshBalance}
                variant="outline"
              >
                Refresh Balance
              </Button>
            </div>
            {!wallet && (
              <p className="text-sm text-red-600">
                ⚠️ No wallet found for this user. Token operations will fail.
              </p>
            )}
          </CardContent>
        </Card>

        {/* Session Booking Test */}
        <Card>
          <CardHeader>
            <CardTitle>Session Booking with Debug Logging</CardTitle>
            <CardDescription>
              Test the complete session booking flow with detailed debug information
            </CardDescription>
          </CardHeader>
          <CardContent>
            <BookingFormDebug
              mentorId="test-mentor-id"
              onFormChange={setFormData}
              onSuccess={() => {
                console.log('🎉 Session booking completed successfully');
                toast.success('Session booking test completed successfully!');
              }}
            />
          </CardContent>
        </Card>

        {/* Form Data Debug */}
        <Card>
          <CardHeader>
            <CardTitle>Current Form Data</CardTitle>
          </CardHeader>
          <CardContent>
            <pre className="text-xs font-mono bg-muted p-4 rounded overflow-x-auto">
              {JSON.stringify(formData, null, 2)}
            </pre>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
