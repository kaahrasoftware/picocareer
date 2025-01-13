import { useQuery } from "@tanstack/react-query";
import { MajorCard } from "@/components/major/MajorCard";
import { supabase } from "@/integrations/supabase/client";

export const FeaturedMajorsSection = () => {
  const { data: majors, isLoading } = useQuery({
    queryKey: ['featured-majors'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('majors')
        .select('*')
        .eq('is_featured', true);

      if (error) {
        console.error('Error fetching featured majors:', error);
        return [];
      }

      return data;
    },
  });

  if (isLoading) return <div>Loading...</div>;

  return (
    <section className="mb-24">
      <div className="text-center mb-12">
        <h2 className="text-3xl font-bold mb-2">Featured Majors</h2>
        <p className="text-muted-foreground">Discover academic programs that align with your career goals.</p>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {majors?.map((major) => (
          <MajorCard key={major.id} major={major} />
        ))}
      </div>
    </section>
  );
};
