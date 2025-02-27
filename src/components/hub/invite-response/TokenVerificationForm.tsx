
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Link } from "react-router-dom";
import { Info, ArrowLeft } from "lucide-react";

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
      // Clean the token input but preserve for logging
      const rawToken = tokenInput.trim();
      console.log("Submitting raw token for verification:", rawToken);
      
      // Check if token is roughly the right format before submission
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
      const noHyphenRegex = /^[0-9a-f]{32}$/i;
      
      if (!uuidRegex.test(rawToken) && !noHyphenRegex.test(rawToken)) {
        console.warn("Token format doesn't match expected pattern:", rawToken);
        // Continue anyway as formatToken will handle this
      }
      
      onVerify(rawToken);
    } catch (error) {
      console.error("Token verification error:", error);
      toast({
        title: "Verification Failed",
        description: "Invalid verification token",
        variant: "destructive",
      });
      setIsVerifying(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-md">
      <Card>
        <CardHeader>
          <CardTitle>Verify Hub Invitation</CardTitle>
          <CardDescription>
            Enter the verification token from your invitation link or email.
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
                autoFocus
              />
              <div className="flex items-start gap-2 text-sm text-muted-foreground">
                <Info className="h-4 w-4 mt-0.5 flex-shrink-0" />
                <p>
                  The token is a unique identifier that looks like:
                  <br />
                  <code className="text-xs bg-muted px-1 py-0.5 rounded">
                    123e4567-e89b-12d3-a456-426614174000
                  </code>
                </p>
              </div>
            </div>
            <Button 
              type="submit" 
              className="w-full"
              disabled={isVerifying}
            >
              {isVerifying ? "Verifying..." : "Verify Token"}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex justify-center border-t pt-4">
          <Link to="/hubs" className="text-sm text-primary hover:underline flex items-center gap-1">
            <ArrowLeft className="h-4 w-4" />
            Return to Hubs
          </Link>
        </CardFooter>
      </Card>
    </div>
  );
}
