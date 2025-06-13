
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Coins, Zap, Star, TrendingUp, Sparkles } from "lucide-react";
import { motion } from "framer-motion";

interface TokenPackage {
  id: string;
  name: string;
  description?: string;
  token_amount: number;
  price_usd: number;
  default_price: string;
  image_url?: string;
}

interface ModernTokenPackageCardProps {
  package: TokenPackage;
  onPurchase: (priceId: string) => void;
  isBestValue?: boolean;
  isMostPopular?: boolean;
  index: number;
}

export function ModernTokenPackageCard({ 
  package: pkg, 
  onPurchase, 
  isBestValue, 
  isMostPopular,
  index
}: ModernTokenPackageCardProps) {
  const pricePerToken = (pkg.price_usd / pkg.token_amount).toFixed(3);
  const savings = pkg.token_amount >= 100 ? Math.round(((0.1 - parseFloat(pricePerToken)) / 0.1) * 100) : 0;

  const getCardTheme = () => {
    if (isBestValue) return {
      gradient: "from-emerald-500/20 via-emerald-500/10 to-emerald-500/5",
      border: "border-emerald-500/30",
      badge: "bg-emerald-500",
      icon: TrendingUp,
      glow: "shadow-emerald-500/20"
    };
    if (isMostPopular) return {
      gradient: "from-blue-500/20 via-blue-500/10 to-blue-500/5",
      border: "border-blue-500/30",
      badge: "bg-blue-500",
      icon: Star,
      glow: "shadow-blue-500/20"
    };
    return {
      gradient: "from-gray-500/10 via-gray-500/5 to-transparent",
      border: "border-gray-200",
      badge: "bg-gray-500",
      icon: Coins,
      glow: "shadow-gray-500/10"
    };
  };

  const theme = getCardTheme();
  const IconComponent = theme.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      whileHover={{ y: -5, scale: 1.02 }}
      className="h-full"
    >
      <Card className={`
        relative overflow-hidden h-full flex flex-col
        bg-gradient-to-br ${theme.gradient}
        ${theme.border} ${theme.glow}
        hover:shadow-xl transition-all duration-300
        group cursor-pointer
      `}>
        {/* Special Badge */}
        {(isBestValue || isMostPopular) && (
          <div className="absolute top-0 right-0 z-10">
            <div className={`${theme.badge} text-white px-4 py-2 text-xs font-bold flex items-center gap-1 rounded-bl-lg`}>
              <IconComponent className="h-3 w-3" />
              {isBestValue ? 'Best Value' : 'Most Popular'}
            </div>
          </div>
        )}

        {/* Decorative Elements */}
        <div className="absolute top-4 left-4 opacity-10">
          <Sparkles className="h-8 w-8" />
        </div>
        <div className="absolute bottom-4 right-4 opacity-5">
          <Coins className="h-12 w-12" />
        </div>

        <CardHeader className="text-center pb-4 relative z-10 flex-shrink-0">
          <div className="mx-auto w-16 h-16 bg-gradient-to-br from-primary to-primary/80 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300 shadow-lg">
            <Coins className="h-8 w-8 text-white" />
          </div>
          <CardTitle className="text-xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
            {pkg.name}
          </CardTitle>
          <p className="text-sm text-muted-foreground mt-2">
            {pkg.description || `Perfect for boosting your career journey`}
          </p>
        </CardHeader>

        <CardContent className="text-center pb-4 relative z-10 flex-grow">
          {/* Price Display */}
          <div className="space-y-3 mb-6">
            <div className="relative">
              <div className="text-3xl font-bold text-primary">${pkg.price_usd}</div>
              <div className="text-xs text-muted-foreground">
                ${pricePerToken} per token
              </div>
            </div>
            
            {/* Token Amount with Visual */}
            <div className="flex items-center justify-center gap-2 p-3 bg-white/50 rounded-lg backdrop-blur-sm">
              <Zap className="h-5 w-5 text-primary" />
              <span className="text-lg font-semibold">{pkg.token_amount}</span>
              <span className="text-sm text-muted-foreground">Tokens</span>
            </div>
          </div>

          {/* Features */}
          <div className="space-y-2 text-sm">
            <div className="flex items-center justify-center gap-2 text-muted-foreground">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              Instant delivery
            </div>
            <div className="flex items-center justify-center gap-2 text-muted-foreground">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              Never expires
            </div>
            {savings > 0 && (
              <Badge variant="secondary" className="bg-green-50 text-green-700 border-green-200">
                Save {savings}% vs smallest package
              </Badge>
            )}
          </div>
        </CardContent>

        <CardFooter className="relative z-10 pt-0">
          <Button 
            className="w-full bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 transition-all duration-300 shadow-lg hover:shadow-xl" 
            onClick={() => onPurchase(pkg.default_price)}
            size="lg"
          >
            <Zap className="h-4 w-4 mr-2" />
            Purchase Now
          </Button>
        </CardFooter>
      </Card>
    </motion.div>
  );
}
