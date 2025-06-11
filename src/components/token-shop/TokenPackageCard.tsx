
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Coins, Zap, Star, TrendingUp } from "lucide-react";

interface TokenPackage {
  id: string;
  name: string;
  description?: string;
  token_amount: number;
  price_usd: number;
  default_price: string;
  image_url?: string;
}

interface TokenPackageCardProps {
  package: TokenPackage;
  onPurchase: (priceId: string) => void;
  isBestValue?: boolean;
  isMostPopular?: boolean;
  viewMode: 'grid' | 'list';
}

export function TokenPackageCard({ 
  package: pkg, 
  onPurchase, 
  isBestValue, 
  isMostPopular, 
  viewMode 
}: TokenPackageCardProps) {
  const pricePerToken = (pkg.price_usd / pkg.token_amount).toFixed(3);
  const savings = pkg.token_amount >= 100 ? Math.round(((0.1 - parseFloat(pricePerToken)) / 0.1) * 100) : 0;

  if (viewMode === 'list') {
    return (
      <Card className="w-full hover:shadow-lg transition-all duration-300 group border-primary/20">
        <div className="flex items-center p-6">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <CardTitle className="text-xl">{pkg.name}</CardTitle>
              {isBestValue && (
                <Badge variant="secondary" className="bg-green-100 text-green-800 hover:bg-green-100">
                  <TrendingUp className="h-3 w-3 mr-1" />
                  Best Value
                </Badge>
              )}
              {isMostPopular && (
                <Badge variant="secondary" className="bg-blue-100 text-blue-800 hover:bg-blue-100">
                  <Star className="h-3 w-3 mr-1" />
                  Most Popular
                </Badge>
              )}
            </div>
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <span className="flex items-center gap-1">
                <Coins className="h-4 w-4" />
                {pkg.token_amount} Tokens
              </span>
              <span>${pricePerToken} per token</span>
              {savings > 0 && (
                <span className="text-green-600 font-medium">Save {savings}%</span>
              )}
            </div>
          </div>
          <div className="text-right mr-6">
            <div className="text-3xl font-bold">${pkg.price_usd}</div>
          </div>
          <Button 
            className="px-8"
            onClick={() => onPurchase(pkg.default_price)}
          >
            Purchase
          </Button>
        </div>
      </Card>
    );
  }

  return (
    <Card className={`w-full hover:shadow-xl transition-all duration-300 group relative overflow-hidden ${
      isBestValue ? 'ring-2 ring-green-500 ring-opacity-50' : 
      isMostPopular ? 'ring-2 ring-blue-500 ring-opacity-50' : ''
    }`}>
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-primary/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      
      {(isBestValue || isMostPopular) && (
        <div className="absolute top-0 right-0 z-10">
          <div className={`${
            isBestValue ? 'bg-green-500' : 'bg-blue-500'
          } text-white px-3 py-1 text-xs font-medium flex items-center gap-1`}>
            {isBestValue ? (
              <>
                <TrendingUp className="h-3 w-3" />
                Best Value
              </>
            ) : (
              <>
                <Star className="h-3 w-3" />
                Most Popular
              </>
            )}
          </div>
        </div>
      )}

      <CardHeader className="text-center pb-4 relative z-10">
        <div className="mx-auto w-16 h-16 bg-gradient-to-br from-primary to-primary/80 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
          <Coins className="h-8 w-8 text-white" />
        </div>
        <CardTitle className="text-2xl font-bold">{pkg.name}</CardTitle>
        <CardDescription className="text-base">
          {pkg.description || `Get ${pkg.token_amount} tokens for your account`}
        </CardDescription>
      </CardHeader>

      <CardContent className="text-center pb-4 relative z-10">
        <div className="mb-4">
          <div className="text-4xl font-bold text-primary mb-1">${pkg.price_usd}</div>
          <div className="text-sm text-muted-foreground">
            ${pricePerToken} per token
          </div>
        </div>
        
        <div className="space-y-2 text-sm">
          <div className="flex items-center justify-center gap-2 text-muted-foreground">
            <Zap className="h-4 w-4" />
            {pkg.token_amount} Tokens
          </div>
          {savings > 0 && (
            <div className="bg-green-50 text-green-700 rounded-full px-3 py-1 text-xs font-medium">
              Save {savings}% vs smallest package
            </div>
          )}
        </div>
      </CardContent>

      <CardFooter className="relative z-10">
        <Button 
          className="w-full group-hover:bg-primary/90 transition-colors duration-300" 
          onClick={() => onPurchase(pkg.default_price)}
          size="lg"
        >
          Purchase Now
        </Button>
      </CardFooter>
    </Card>
  );
}
