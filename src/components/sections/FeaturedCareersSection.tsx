import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { CareerCard } from "@/components/CareerCard";

export const FeaturedCareersSection = () => {
  const { data: careers, isLoading } = useQuery({
    queryKey: ['featured-careers'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('careers')
        .select('*')
        .eq('status', 'Approved')
        .limit(6);

      if (error) throw error;
      return data;
    },
  });

  if (isLoading) return <div>Loading...</div>;

  return (
    <section className="mb-24">
      <div className="text-center mb-12">
        <h2 className="text-3xl font-bold mb-2">Featured Careers</h2>
        <p className="text-muted-foreground">Explore trending and in-demand career paths curated for you.</p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {careers?.map((career) => (
          <CareerCard key={career.id} career={career} />
        ))}
      </div>
    </section>
  );
};
