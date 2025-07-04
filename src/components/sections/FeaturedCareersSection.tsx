
import { useState } from "react";
import { ModernCareerCard } from "@/components/cards/ModernCareerCard";
import { CareerListDialog } from "@/components/CareerListDialog";
import { useFeaturedCareers } from "@/hooks/useFeaturedCareers";
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

  if (isLoading) {
    return (
      <div className="text-center py-12">
        <div className="flex items-center justify-center">
          <div className="w-8 h-8 border-4 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
        <p className="text-gray-500 mt-4">Loading featured careers...</p>
      </div>
    );
  }

  if (error) {
    console.error('Error fetching featured careers:', error);
    return (
      <div className="text-center py-12">
        <p className="text-red-500">Failed to load featured careers. Please try again later.</p>
      </div>
    );
  }

  if (careers.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">No featured careers available at the moment.</p>
      </div>
    );
  }

  return (
    <>
      <div className="relative">
        <Carousel
          opts={{
            align: "start",
            loop: true,
          }}
          className="w-full"
        >
          <CarouselContent className="-ml-4">
            {careers.map((career) => (
              <CarouselItem 
                key={career.id} 
                className="pl-4 basis-full sm:basis-1/2 md:basis-1/3"
              >
                <ModernCareerCard 
                  {...career} 
                  onClick={() => handleCareerClick(career.id)} 
                />
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
      
      {selectedCareerId && (
        <CareerDetailsDialog
          careerId={selectedCareerId}
          open={isDetailsDialogOpen}
          onOpenChange={handleDetailsDialogOpenChange}
        />
      )}
    </>
  );
};
