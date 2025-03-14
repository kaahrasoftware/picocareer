
import { useState } from "react";
import { CareerCard } from "@/components/CareerCard";
import { CareerListDialog } from "@/components/CareerListDialog";
import { useFeaturedCareers } from "@/hooks/useFeaturedCareers";
import { Link } from "react-router-dom";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { CareerDetailsDialog } from "@/components/CareerDetailsDialog";

export const FeaturedCareersSection = () => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { data: careers = [], isLoading, error } = useFeaturedCareers();
  const [selectedCareerId, setSelectedCareerId] = useState<string | null>(null);
  const [isDetailsDialogOpen, setIsDetailsDialogOpen] = useState(false);

  const handleCareerClick = (careerId: string) => {
    setSelectedCareerId(careerId);
    setIsDetailsDialogOpen(true);
  };

  const handleDetailsDialogOpenChange = (open: boolean) => {
    setIsDetailsDialogOpen(open);
    if (!open) {
      setSelectedCareerId(null);
    }
  };

  // Return loading state first
  if (isLoading) {
    return (
      <section className="mb-16">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">Featured Careers</h2>
        </div>
        <div className="flex items-center justify-center p-8">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
        </div>
      </section>
    );
  }

  // Return error state if there's an error
  if (error) {
    console.error('Error fetching featured careers:', error);
    return (
      <section className="mb-16">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">Featured Careers</h2>
        </div>
        <div className="text-center text-red-500 p-8">
          Failed to load featured careers. Please try again later.
        </div>
      </section>
    );
  }

  return (
    <section className="mb-16">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Featured Careers</h2>
        <Link 
          to="/career"
          className="text-primary hover:text-primary/80 transition-colors"
        >
          View all
        </Link>
      </div>
      <div className="relative -mx-4 sm:-mx-6 md:-mx-8">
        <Carousel
          opts={{
            align: "start",
            loop: true,
          }}
          className="w-full px-4 sm:px-6 md:px-8"
        >
          <CarouselContent className="-ml-4">
            {careers.map((career) => (
              <CarouselItem 
                key={career.id} 
                className="pl-4 basis-full sm:basis-1/2 md:basis-1/3 lg:basis-1/4 transition-all duration-300"
              >
                <CareerCard 
                  {...career} 
                  onClick={() => handleCareerClick(career.id)} 
                />
              </CarouselItem>
            ))}
          </CarouselContent>
          <CarouselPrevious className="hidden sm:flex absolute -left-2 sm:-left-3 md:-left-4 top-1/2 -translate-y-1/2 h-8 w-8" />
          <CarouselNext className="hidden sm:flex absolute -right-2 sm:-right-3 md:-right-4 top-1/2 -translate-y-1/2 h-8 w-8" />
        </Carousel>
      </div>
      
      <CareerListDialog
        isOpen={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        careers={careers}
      />
      
      {selectedCareerId && (
        <CareerDetailsDialog
          careerId={selectedCareerId}
          open={isDetailsDialogOpen}
          onOpenChange={handleDetailsDialogOpenChange}
        />
      )}
    </section>
  );
};
