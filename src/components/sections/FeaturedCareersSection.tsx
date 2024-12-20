import { useState } from "react";
import { CareerCard } from "@/components/CareerCard";
import { CareerListDialog } from "@/components/CareerListDialog";
import { useFeaturedCareers } from "@/hooks/useFeaturedCareers";
import type { Tables } from "@/integrations/supabase/types";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";

interface FeaturedCareersSectionProps {
  initialCareers?: Tables<"careers">[];
}

export const FeaturedCareersSection = ({ initialCareers }: FeaturedCareersSectionProps) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { data: careers = initialCareers ?? [], isLoading } = useFeaturedCareers();

  if (isLoading && !initialCareers) {
    return <div>Loading...</div>;
  }

  return (
    <section className="mb-16">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Featured Careers</h2>
        <button 
          onClick={() => setIsDialogOpen(true)}
          className="text-primary hover:text-primary/80 transition-colors"
        >
          View all
        </button>
      </div>
      <div className="relative -mx-8">
        <Carousel
          opts={{
            align: "start",
            loop: true,
          }}
          className="w-full px-8"
        >
          <CarouselContent className="-ml-4">
            {careers.map((career) => (
              <CarouselItem key={career.id} className="pl-4 basis-full md:basis-1/3">
                <CareerCard {...career} />
              </CarouselItem>
            ))}
          </CarouselContent>
          <CarouselPrevious className="hidden md:flex absolute -left-4 top-1/2 -translate-y-1/2 h-8 w-8" />
          <CarouselNext className="hidden md:flex absolute -right-4 top-1/2 -translate-y-1/2 h-8 w-8" />
        </Carousel>
      </div>
      <CareerListDialog
        isOpen={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        careers={careers}
      />
    </section>
  );
};