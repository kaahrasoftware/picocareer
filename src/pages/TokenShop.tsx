import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

interface TokenPackage {
  id: string;
  name: string;
  description?: string;
  token_amount: number;
  price_usd: number;
  image_url?: string;
}

export default function TokenShop() {
  const { data: tokenPackages, isLoading } = useQuery({
    queryKey: ['tokenPackages'],
    queryFn: async () => {
      const response = await supabase.functions.invoke('get-token-packages');
      if (response.error) throw response.error;
      return response.data as TokenPackage[];
    }
  });

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
              <Button className="w-full">Purchase</Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
}