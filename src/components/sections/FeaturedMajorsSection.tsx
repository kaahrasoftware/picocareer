import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { MajorCard } from "@/components/MajorCard";
import { Skeleton } from "@/components/ui/skeleton";
import { useCallback } from "react";

export function FeaturedMajorsSection() {
  const { data: majors, isLoading, error } = useQuery({
    queryKey: ['featured-majors'],
    queryFn: useCallback(async () => {
      const { data, error } = await supabase
        .from('majors')
        .select('*')
        .eq('featured', true)
        .eq('status', 'Approved')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching featured majors:', error);
        throw error;
      }

      return data;
    }, []),
  });

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(3)].map((_, i) => (
          <Skeleton key={i} className="h-[300px] w-full" />
        ))}
      </div>
    );
  }

  if (error) {
    console.error('Error:', error);
    return null;
  }

  if (!majors?.length) {
    return null;
  }

  return (
    <section className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold tracking-tight">Featured Majors</h2>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {majors.map((major) => (
          <MajorCard key={major.id} major={major} />
        ))}
      </div>
    </section>
  );
}