
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Link } from "react-router-dom";

interface TokenVerificationFormProps {
  onVerify: (token: string) => void;
}

export function TokenVerificationForm({ onVerify }: TokenVerificationFormProps) {
  const [tokenInput, setTokenInput] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!tokenInput.trim()) {
      toast({
        title: "Verification Failed",
        description: "Please enter a verification token",
        variant: "destructive",
      });
      return;
    }

    setIsVerifying(true);
    try {
      // Clean the token input
      const cleanToken = tokenInput.trim();
      console.log("Submitting token for verification:", cleanToken);
      onVerify(cleanToken);
    } catch (error) {
      console.error("Token verification error:", error);
      toast({
        title: "Verification Failed",
        description: "Invalid verification token",
        variant: "destructive",
      });
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-md">
      <Card>
        <CardHeader>
          <CardTitle>Verify Invitation</CardTitle>
          <CardDescription>
            Enter the verification token you received in your invitation link.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Input
                type="text"
                placeholder="Enter verification token"
                value={tokenInput}
                onChange={(e) => setTokenInput(e.target.value)}
                className="w-full"
              />
            </div>
            <Button 
              type="submit" 
              className="w-full"
              disabled={isVerifying}
            >
              {isVerifying ? "Verifying..." : "Verify Token"}
            </Button>
            <div className="text-sm text-muted-foreground text-center pt-2">
              <Link to="/hubs" className="text-primary hover:underline">
                Return to Hubs
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
