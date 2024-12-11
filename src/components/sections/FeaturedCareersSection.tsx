import { useState } from "react";
import { CareerCard, CareerCardProps } from "@/components/CareerCard";
import { CareerListDialog } from "@/components/CareerListDialog";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";

const fetchFeaturedCareers = async () => {
  const { data, error } = await supabase
    .from('careers')
    .select('*')
    .eq('featured', true);

  if (error) {
    throw error;
  }

  return data as CareerCardProps[];
};

export const FeaturedCareersSection = () => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  
  const { data: careers, isLoading, error } = useQuery({
    queryKey: ['featuredCareers'],
    queryFn: fetchFeaturedCareers,
  });

  if (isLoading) {
    return (
      <section className="mb-16">
        <h2 className="text-2xl font-bold mb-6">Featured Careers</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-48 bg-background/50 animate-pulse rounded-lg" />
          ))}
        </div>
      </section>
    );
  }

  if (error) {
    console.error('Error fetching featured careers:', error);
    return (
      <section className="mb-16">
        <h2 className="text-2xl font-bold mb-6">Featured Careers</h2>
        <div className="text-center text-muted-foreground">
          Failed to load featured careers. Please try again later.
        </div>
      </section>
    );
  }

  return (
    <section className="mb-16">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Featured Careers</h2>
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
          {careers?.map((career) => (
            <CarouselItem key={career.id} className="basis-1/3">
              <CareerCard {...career} />
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselPrevious className="hidden md:flex" />
        <CarouselNext className="hidden md:flex" />
      </Carousel>
      <CareerListDialog
        isOpen={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        careers={careers || []}
      />
    </section>
  );
};