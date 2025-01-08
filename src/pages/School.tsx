import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import type { School } from "@/types/database/schools";

export default function School() {
  const { data: schools, isLoading } = useQuery({
    queryKey: ['schools'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('schools')
        .select('*')
        .order('name');
      
      if (error) throw error;
      
      // Transform the data to include location based on state and country
      return (data as any[]).map(school => ({
        ...school,
        location: school.state ? `${school.state}, ${school.country}` : school.country
      })) as School[];
    }
  });

  if (isLoading) {
    return (
      <div className="container mx-auto py-8 space-y-4">
        <Skeleton className="h-8 w-64" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-48" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-8">Schools Directory</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {schools?.map((school) => (
          <Card key={school.id}>
            <CardHeader>
              <CardTitle>{school.name}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-2">
                Location: {school.location || 'Not specified'}
              </p>
              <p className="text-sm text-muted-foreground mb-2">
                Type: {school.type || 'Not specified'}
              </p>
              {school.acceptance_rate && (
                <p className="text-sm text-muted-foreground">
                  Acceptance Rate: {(school.acceptance_rate * 100).toFixed(1)}%
                </p>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}