import { useState } from "react";
import { MentorCard } from "@/components/MentorCard";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { User } from "@/integrations/supabase/types/user.types";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";

const fetchTopRatedMentors = async () => {
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('user_type', 'mentor')
    .eq('top_rated', true);

  if (error) {
    throw error;
  }

  if (!data) return [];

  // Convert stats from JSON to UserStats type
  return data.map(mentor => ({
    ...mentor,
    stats: typeof mentor.stats === 'string' 
      ? JSON.parse(mentor.stats)
      : mentor.stats
  })) as User[];
};

export const TopRatedMentorsSection = () => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  
  const { data: mentors, isLoading, error } = useQuery({
    queryKey: ['topRatedMentors'],
    queryFn: fetchTopRatedMentors,
  });

  if (isLoading) {
    return (
      <section className="mb-16">
        <h2 className="text-2xl font-bold mb-6">Top Rated Mentors</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-48 bg-background/50 animate-pulse rounded-lg" />
          ))}
        </div>
      </section>
    );
  }

  if (error) {
    console.error('Error fetching top rated mentors:', error);
    return (
      <section className="mb-16">
        <h2 className="text-2xl font-bold mb-6">Top Rated Mentors</h2>
        <div className="text-center text-muted-foreground">
          Failed to load top rated mentors. Please try again later.
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
          {mentors?.map((mentor) => (
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