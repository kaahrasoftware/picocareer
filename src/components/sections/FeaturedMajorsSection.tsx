
import { useState } from "react";
import { ModernMajorCard } from "@/components/cards/ModernMajorCard";
import { MajorListDialog } from "@/components/MajorListDialog";
import { useFeaturedMajors } from "@/hooks/useFeaturedMajors";
import { useToast } from "@/hooks/use-toast";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";

export const FeaturedMajorsSection = () => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { toast } = useToast();
  const { data: majors = [], isLoading, error } = useFeaturedMajors();

  if (error) {
    toast({
      title: "Error",
      description: "Failed to load featured majors. Please try again later.",
      variant: "destructive",
    });
  }

  if (isLoading) {
    return (
      <div className="text-center py-12">
        <div className="flex items-center justify-center">
          <div className="w-8 h-8 border-4 border-green-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
        <p className="text-gray-500 mt-4">Loading featured programs...</p>
      </div>
    );
  }

  if (majors.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">No featured programs available at the moment.</p>
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
            {majors.map((major) => (
              <CarouselItem key={major.id} className="pl-4 basis-full md:basis-1/2 lg:basis-1/3">
                <ModernMajorCard {...major} />
              </CarouselItem>
            ))}
          </CarouselContent>
          <CarouselPrevious className="hidden md:flex" />
          <CarouselNext className="hidden md:flex" />
        </Carousel>
      </div>
      
      <MajorListDialog
        isOpen={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        majors={majors}
      />
    </>
  );
};
