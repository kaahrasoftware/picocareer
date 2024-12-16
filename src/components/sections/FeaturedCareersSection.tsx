import { useState } from "react";
import { CareerCard } from "@/components/CareerCard";
import { CareerListDialog } from "@/components/CareerListDialog";
import { useFeaturedCareers } from "@/hooks/useFeaturedCareers";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import Autoplay from "embla-carousel-autoplay";

export const FeaturedCareersSection = () => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { data: careers = [], isLoading } = useFeaturedCareers();

  if (isLoading) {
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
      <div className="relative">
        <Carousel
          opts={{
            align: "start",
            loop: true,
          }}
          plugins={[
            Autoplay({
              delay: 4000,
              stopOnInteraction: true,
              stopOnMouseEnter: true,
            }),
          ]}
          className="w-full"
        >
          <CarouselContent>
            {careers.map((career) => (
              <CarouselItem key={career.id} className="basis-1/3">
                <CareerCard {...career} />
              </CarouselItem>
            ))}
          </CarouselContent>
          <CarouselPrevious className="hidden md:flex" />
          <CarouselNext className="hidden md:flex" />
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