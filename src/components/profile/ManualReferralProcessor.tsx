
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useReferralProcessor } from "@/hooks/useReferralProcessor";
import { Gift } from "lucide-react";

export function ManualReferralProcessor() {
  const [referralCode, setReferralCode] = useState("");
  const { processReferralCode, isProcessing } = useReferralProcessor();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!referralCode.trim()) return;
    
    const result = await processReferralCode(referralCode.trim());
    if (result.success) {
      setReferralCode("");
    }
  };

  return (
    <Card className="max-w-md">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Gift className="h-5 w-5" />
          Enter Referral Code
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="referral-code">Referral Code</Label>
            <Input
              id="referral-code"
              type="text"
              placeholder="Enter referral code"
              value={referralCode}
              onChange={(e) => setReferralCode(e.target.value)}
              disabled={isProcessing}
            />
          </div>
          <Button 
            type="submit" 
            disabled={!referralCode.trim() || isProcessing}
            className="w-full"
          >
            {isProcessing ? "Processing..." : "Apply Referral Code"}
          </Button>
          <p className="text-xs text-muted-foreground">
            If someone referred you to PicoCareer, enter their referral code here to help them earn tokens.
          </p>
        </form>
      </CardContent>
    </Card>
  );
}
