
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Link } from "react-router-dom";
import { Info, ArrowLeft, Check, X } from "lucide-react";
import { isValidTokenFormat } from "@/hooks/hub/utils/tokenUtils";

interface TokenVerificationFormProps {
  onVerify: (token: string) => void;
}

export function TokenVerificationForm({ onVerify }: TokenVerificationFormProps) {
  const [tokenInput, setTokenInput] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);
  const [isValidFormat, setIsValidFormat] = useState<boolean | null>(null);
  const { toast } = useToast();

  // Validate token format as user types
  useEffect(() => {
    if (tokenInput.trim() === "") {
      setIsValidFormat(null);
      return;
    }
    
    setIsValidFormat(isValidTokenFormat(tokenInput));
  }, [tokenInput]);

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

    if (!isValidFormat) {
      toast({
        title: "Invalid Format",
        description: "Please enter a valid token format (UUID)",
        variant: "destructive",
      });
      return;
    }

    setIsVerifying(true);
    try {
      // Clean the token input but preserve for logging
      console.log("Starting verification for token:", tokenInput);
      
      onVerify(tokenInput);
    } catch (error) {
      console.error("Token verification error:", error);
      setIsVerifying(false);
      
      toast({
        title: "Verification Failed",
        description: "There was a problem verifying your token",
        variant: "destructive",
      });
    }
  };

  // Allow pasting the full invitation link
  const handlePaste = (e: React.ClipboardEvent) => {
    const pastedText = e.clipboardData.getData('text');
    
    // Check if it's a URL with a token
    if (pastedText.includes('hub-invite') && pastedText.includes('token=')) {
      try {
        const url = new URL(pastedText);
        const token = url.searchParams.get('token');
        if (token) {
          e.preventDefault();
          setTokenInput(token);
        }
      } catch (error) {
        // Not a valid URL, just paste as normal
      }
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
              <div className="relative">
                <Input
                  type="text"
                  placeholder="Enter verification token"
                  value={tokenInput}
                  onChange={(e) => setTokenInput(e.target.value)}
                  onPaste={handlePaste}
                  className={`w-full pr-10 ${
                    isValidFormat === true ? 'border-green-500' : 
                    isValidFormat === false ? 'border-red-500' : ''
                  }`}
                  autoFocus
                />
                {isValidFormat !== null && (
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                    {isValidFormat ? (
                      <Check className="h-5 w-5 text-green-500" />
                    ) : (
                      <X className="h-5 w-5 text-red-500" />
                    )}
                  </div>
                )}
              </div>
              
              <div className="flex items-start gap-2 text-sm text-muted-foreground">
                <Info className="h-4 w-4 mt-0.5 flex-shrink-0" />
                <div>
                  <p>
                    The token is a unique identifier that looks like:
                  </p>
                  <div className="bg-muted/50 p-1.5 mt-1 rounded text-xs font-mono">
                    <code>123e4567-e89b-12d3-a456-426614174000</code>
                  </div>
                  <p className="mt-1">You can paste the full invitation link or just the token.</p>
                </div>
              </div>
            </div>
            
            <Button 
              type="submit" 
              className="w-full"
              disabled={isVerifying || !tokenInput.trim() || isValidFormat === false}
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
