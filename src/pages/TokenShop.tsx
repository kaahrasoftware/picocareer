import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useEffect, useState } from "react";
import { TokenShopHeader } from "@/components/token-shop/TokenShopHeader";
import { TokenShopFilters } from "@/components/token-shop/TokenShopFilters";
import { TokenPackageCard } from "@/components/token-shop/TokenPackageCard";
import { TokenShopHero } from "@/components/token-shop/TokenShopHero";
import { PaymentMethodDialog } from "@/components/token-shop/PaymentMethodDialog";

interface TokenPackage {
  id: string;
  name: string;
  description?: string;
  token_amount: number;
  price_usd: number;
  default_price: string;
  image_url?: string;
}

interface FilterState {
  priceRange: [number, number];
  tokenRange: [number, number];
  sortBy: string;
  searchQuery: string;
}

export default function TokenShop() {
  const navigate = useNavigate();
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [filters, setFilters] = useState<FilterState>({
    priceRange: [0, 100],
    tokenRange: [0, 500],
    sortBy: 'price-asc',
    searchQuery: ''
  });

  // Payment dialog state
  const [isPaymentDialogOpen, setIsPaymentDialogOpen] = useState(false);
  const [selectedPackageForPayment, setSelectedPackageForPayment] = useState<TokenPackage | null>(null);

  // Call all hooks at the top level
  const { data: session } = useQuery({
    queryKey: ['auth-session'],
    queryFn: async () => {
      const { data: { session } } = await supabase.auth.getSession();
      return session;
    }
  });

  const { data: profile } = useQuery({
    queryKey: ['profile', session?.user?.id],
    queryFn: async () => {
      if (!session?.user?.id) return null;
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', session.user.id)
        .single();
      if (error) throw error;
      return data;
    },
    enabled: !!session?.user?.id
  });

  // Updated to fetch from database with proper error handling
  const { data: tokenPackages, isLoading, error } = useQuery({
    queryKey: ['tokenPackages'],
    queryFn: async () => {
      console.log('Fetching token packages from database...');
      
      const { data, error } = await supabase
        .from('token_packages')
        .select('*')
        .eq('is_active', true)
        .order('token_amount', { ascending: true }); // Order by token_amount instead of sort_order
      
      if (error) {
        console.error('Error fetching token packages:', error);
        throw error;
      }
      
      console.log('Token packages fetched:', data);
      
      // Transform the data to match the expected interface
      return data.map(pkg => ({
        id: pkg.id,
        name: pkg.name,
        description: pkg.description,
        token_amount: pkg.token_amount,
        price_usd: Number(pkg.price_usd),
        default_price: pkg.default_price,
        image_url: pkg.image_url
      })) as TokenPackage[];
    }
  });

  // Log any errors
  useEffect(() => {
    if (error) {
      console.error('Token packages query error:', error);
      toast({
        title: "Error loading packages",
        description: "Failed to load token packages. Please try again.",
        variant: "destructive",
      });
    }
  }, [error]);

  // Redirect non-admin users
  useEffect(() => {
    if (profile && profile.user_type !== 'admin') {
      toast({
        title: "Access Denied",
        description: "Only administrators can access the Token Shop.",
        variant: "destructive",
      });
      navigate("/");
    }
  }, [profile, navigate]);

  const handlePurchase = async (priceId: string) => {
    const selectedPackage = tokenPackages?.find(pkg => pkg.default_price === priceId);
    if (selectedPackage) {
      setSelectedPackageForPayment(selectedPackage);
      setIsPaymentDialogOpen(true);
    }
  };

  const handleContinueWithStripe = async (priceId: string) => {
    try {
      if (!session) {
        toast({
          title: "Authentication required",
          description: "Please sign in to purchase tokens",
          variant: "destructive",
        });
        navigate("/auth");
        return;
      }

      console.log('Package price ID:', priceId);

      const response = await supabase.functions.invoke('create-token-checkout', {
        body: { priceId },
      });

      console.log('Checkout response:', response);

      if (response.error) {
        throw response.error;
      }

      if (response.data?.url) {
        window.location.href = response.data.url;
      }
    } catch (error) {
      console.error('Purchase error:', error);
      toast({
        title: "Error",
        description: "Failed to initiate purchase. Please try again.",
        variant: "destructive",
      });
    }
  };

  // Update max values based on actual data
  useEffect(() => {
    if (tokenPackages && tokenPackages.length > 0) {
      const maxPrice = Math.max(...tokenPackages.map(p => p.price_usd));
      const maxTokens = Math.max(...tokenPackages.map(p => p.token_amount));
      
      setFilters(prev => ({
        ...prev,
        priceRange: [0, maxPrice],
        tokenRange: [0, maxTokens]
      }));
    }
  }, [tokenPackages]);

  // Filter and sort packages
  const filteredPackages = tokenPackages?.filter(pkg => {
    const matchesPrice = pkg.price_usd >= filters.priceRange[0] && pkg.price_usd <= filters.priceRange[1];
    const matchesTokens = pkg.token_amount >= filters.tokenRange[0] && pkg.token_amount <= filters.tokenRange[1];
    const matchesSearch = pkg.name.toLowerCase().includes(filters.searchQuery.toLowerCase());
    return matchesPrice && matchesTokens && matchesSearch;
  }).sort((a, b) => {
    switch (filters.sortBy) {
      case 'price-asc':
        return a.price_usd - b.price_usd;
      case 'price-desc':
        return b.price_usd - a.price_usd;
      case 'tokens-asc':
        return a.token_amount - b.token_amount;
      case 'tokens-desc':
        return b.token_amount - a.token_amount;
      case 'value-best':
        return (a.price_usd / a.token_amount) - (b.price_usd / b.token_amount);
      default:
        return 0;
    }
  });

  // Don't render anything while checking user type
  if (!profile) {
    return null;
  }

  // Only render for admin users
  if (profile.user_type !== 'admin') {
    return null;
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
        <div className="container mx-auto py-8">
          <TokenShopHero />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="w-full">
                <CardHeader>
                  <Skeleton className="h-8 w-3/4 mb-2" />
                  <Skeleton className="h-4 w-1/2" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-16 w-full" />
                </CardContent>
                <CardFooter>
                  <Skeleton className="h-10 w-full" />
                </CardFooter>
              </Card>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
        <div className="container mx-auto py-8">
          <TokenShopHero />
          <div className="text-center py-12">
            <div className="text-muted-foreground text-lg mb-4">
              Failed to load token packages
            </div>
            <Button 
              onClick={() => window.location.reload()}
              variant="outline"
            >
              Try Again
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const getBestValuePackage = () => {
    if (!tokenPackages) return null;
    return tokenPackages.reduce((best, current) => {
      const currentValue = current.price_usd / current.token_amount;
      const bestValue = best.price_usd / best.token_amount;
      return currentValue < bestValue ? current : best;
    });
  };

  const getMostPopularPackage = () => {
    // For now, we'll assume the middle-priced package is most popular
    if (!tokenPackages) return null;
    const sorted = [...tokenPackages].sort((a, b) => a.price_usd - b.price_usd);
    return sorted[Math.floor(sorted.length / 2)];
  };

  const bestValue = getBestValuePackage();
  const mostPopular = getMostPopularPackage();

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      <div className="container mx-auto py-8">
        <TokenShopHero />
        
        <div className="mt-12">
          <TokenShopHeader 
            totalPackages={filteredPackages?.length || 0}
            viewMode={viewMode}
            onViewModeChange={setViewMode}
          />
          
          <div className="flex flex-col lg:flex-row gap-8 mt-6">
            <div className="lg:w-1/4">
              <TokenShopFilters 
                filters={filters}
                onFiltersChange={setFilters}
                packages={tokenPackages || []}
              />
            </div>
            
            <div className="lg:w-3/4">
              {filteredPackages && filteredPackages.length > 0 ? (
                <div className={viewMode === 'grid' 
                  ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" 
                  : "space-y-4"
                }>
                  {filteredPackages.map((pkg) => (
                    <TokenPackageCard
                      key={pkg.id}
                      package={pkg}
                      onPurchase={handlePurchase}
                      isBestValue={bestValue?.id === pkg.id}
                      isMostPopular={mostPopular?.id === pkg.id}
                      viewMode={viewMode}
                    />
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <div className="text-muted-foreground text-lg">
                    No token packages found matching your criteria.
                  </div>
                  <Button 
                    variant="outline" 
                    className="mt-4"
                    onClick={() => setFilters({
                      priceRange: [0, 100],
                      tokenRange: [0, 500],
                      sortBy: 'price-asc',
                      searchQuery: ''
                    })}
                  >
                    Clear Filters
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <PaymentMethodDialog
        isOpen={isPaymentDialogOpen}
        onClose={() => setIsPaymentDialogOpen(false)}
        selectedPackage={selectedPackageForPayment}
        onContinueWithStripe={handleContinueWithStripe}
      />
    </div>
  );
}
