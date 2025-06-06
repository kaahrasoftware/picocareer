import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useEffect } from "react";

interface TokenPackage {
  id: string;
  name: string;
  description?: string;
  token_amount: number;
  price_usd: number;
  default_price: string;
  image_url?: string;
}

export default function TokenShop() {
  const navigate = useNavigate();

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

  const { data: tokenPackages, isLoading } = useQuery({
    queryKey: ['tokenPackages'],
    queryFn: async () => {
      const response = await supabase.functions.invoke('get-token-packages');
      if (response.error) throw response.error;
      return response.data as TokenPackage[];
    }
  });

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
      <div className="container mx-auto py-8">
        <h1 className="text-3xl font-bold mb-8">Token Shop</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
    );
  }

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-8">Token Shop</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {tokenPackages?.map((pkg) => (
          <Card key={pkg.id} className="w-full">
            <CardHeader>
              <CardTitle>{pkg.name}</CardTitle>
              <CardDescription>
                {pkg.description}
                <div className="mt-2">{pkg.token_amount} Tokens</div>
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${pkg.price_usd}</div>
            </CardContent>
            <CardFooter>
              <Button 
                className="w-full" 
                onClick={() => handlePurchase(pkg.default_price)}
              >
                Purchase
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
}