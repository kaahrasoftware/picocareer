import { useState } from "react";
import { MentorCard } from "@/components/MentorCard";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";

export const TopRatedMentorsSection = () => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const { data: topRatedMentors, isLoading } = useQuery({
    queryKey: ['topRatedMentors'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('user_type', 'mentor')
        .eq('top_rated', true)
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error('Error fetching top rated mentors:', error);
        throw error;
      }
      
      return data?.map(mentor => ({
        ...mentor,
        stats: typeof mentor.stats === 'string' 
          ? JSON.parse(mentor.stats)
          : mentor.stats
      })) || [];
    },
  });

  if (isLoading) {
    return (
      <section className="mb-16">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">Top Rated Mentors</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-48 bg-muted animate-pulse rounded-lg" />
          ))}
        </div>
      </section>
    );
  }

  return (
    <section className="mb-16">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Top Rated Mentors</h2>
        <button 
          onClick={() => setIsDialogOpen(true)}
          className="text-kahra-primary hover:text-kahra-primary/80 transition-colors"
        >
          View all
        </button>
      </div>
      <Carousel
        opts={{
          align: "start",
          loop: true,
        }}
        className="w-full"
      >
        <CarouselContent>
          {topRatedMentors?.map((mentor) => (
            <CarouselItem key={mentor.id} className="basis-1/3">
              <MentorCard {...mentor} />
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselPrevious className="hidden md:flex" />
        <CarouselNext className="hidden md:flex" />
      </Carousel>
    </section>
  );
};