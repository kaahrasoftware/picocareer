import { useQuery } from "@tanstack/react-query";
import { MentorCard } from "@/components/MentorCard";
import { supabase } from "@/integrations/supabase/client";

export const TopRatedMentorsSection = () => {
  const { data: mentors, isLoading } = useQuery({
    queryKey: ['top-rated-mentors'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, first_name, last_name, avatar_url, position, company:companies(name)')
        .eq('user_type', 'mentor')
        .order('rating', { ascending: false })
        .limit(6);

      if (error) throw error;
      return data;
    },
  });

  if (isLoading) return <div>Loading...</div>;

  return (
    <section className="mb-24">
      <div className="text-center mb-12">
        <h2 className="text-3xl font-bold mb-2">Top Rated Mentors</h2>
        <p className="text-muted-foreground">Learn from experienced professionals who are passionate about helping you succeed.</p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {mentors?.map((mentor) => (
          <MentorCard key={mentor.id} mentor={mentor} />
        ))}
      </div>
    </section>
  );
};
