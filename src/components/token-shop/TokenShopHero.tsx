
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Coins, Shield, Zap, Users } from "lucide-react";

export function TokenShopHero() {
  return (
    <div className="text-center mb-12">
      <div className="inline-flex items-center gap-2 bg-primary/10 text-primary rounded-full px-4 py-2 mb-6">
        <Coins className="h-4 w-4" />
        <span className="text-sm font-medium">Token Shop</span>
      </div>
      
      <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-primary via-primary to-primary/80 bg-clip-text text-transparent mb-4">
        Power Up Your Experience
      </h1>
      
      <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-8">
        Purchase tokens to unlock premium features, priority support, and exclusive content. 
        Choose the perfect package for your needs.
      </p>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-4xl mx-auto">
        <Card className="border-primary/20 bg-primary/5">
          <CardContent className="p-6 text-center">
            <Shield className="h-8 w-8 text-primary mx-auto mb-3" />
            <h3 className="font-semibold mb-2">Secure Payments</h3>
            <p className="text-sm text-muted-foreground">
              All transactions are encrypted and secure through Stripe
            </p>
          </CardContent>
        </Card>
        
        <Card className="border-primary/20 bg-primary/5">
          <CardContent className="p-6 text-center">
            <Zap className="h-8 w-8 text-primary mx-auto mb-3" />
            <h3 className="font-semibold mb-2">Instant Access</h3>
            <p className="text-sm text-muted-foreground">
              Tokens are added to your account immediately after purchase
            </p>
          </CardContent>
        </Card>
        
        <Card className="border-primary/20 bg-primary/5">
          <CardContent className="p-6 text-center">
            <Users className="h-8 w-8 text-primary mx-auto mb-3" />
            <h3 className="font-semibold mb-2">Premium Support</h3>
            <p className="text-sm text-muted-foreground">
              Get priority help and access to exclusive features
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
