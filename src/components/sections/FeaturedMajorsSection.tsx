import { useState, useEffect } from "react";
import { MajorCard } from "@/components/MajorCard";
import { MajorListDialog } from "@/components/MajorListDialog";
import { useFeaturedMajors } from "@/hooks/useFeaturedMajors";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";

export const FeaturedMajorsSection = () => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { data: majors = [], isLoading, refetch } = useFeaturedMajors();

  useEffect(() => {
    refetch();
    const intervalId = setInterval(() => {
      console.log("Refreshing majors data...");
      refetch();
    }, 10000);
    return () => clearInterval(intervalId);
  }, [refetch]);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <section className="mb-16">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Featured Majors</h2>
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
            {majors.map((major) => (
              <CarouselItem key={major.id} className="pl-4 basis-full md:basis-1/3">
                <MajorCard {...major} />
              </CarouselItem>
            ))}
          </CarouselContent>
          <CarouselPrevious className="hidden md:flex absolute -left-4 top-1/2 -translate-y-1/2 h-8 w-8" />
          <CarouselNext className="hidden md:flex absolute -right-4 top-1/2 -translate-y-1/2 h-8 w-8" />
        </Carousel>
      </div>
      <MajorListDialog
        isOpen={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        majors={majors}
      />
    </section>
  );
};