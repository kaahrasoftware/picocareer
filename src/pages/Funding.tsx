
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { ScholarshipCard } from "@/components/scholarships/ScholarshipCard";

export default function Funding() {
  const { data: scholarships, isLoading } = useQuery({
    queryKey: ['scholarships'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('scholarships')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    }
  });

  if (isLoading) {
    return (
      <div className="container mx-auto py-8 space-y-4">
        <Skeleton className="h-8 w-64" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-48" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-8">Scholarships & Funding</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {scholarships?.map((scholarship) => (
          <ScholarshipCard 
            key={scholarship.id} 
            scholarship={{
              ...scholarship,
              eligibility_criteria: scholarship.eligibility_criteria as any
            }} 
          />
        ))}
      </div>
    </div>
  );
}
