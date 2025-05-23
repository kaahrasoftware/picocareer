
import { useState } from "react";
import { SchoolCard } from "@/components/SchoolCard";
import { useFeaturedSchools } from "@/hooks/useFeaturedSchools";
import { useToast } from "@/hooks/use-toast";
import { Link } from "react-router-dom";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";

export const FeaturedSchoolsSection = () => {
  const { data: schools = [], isLoading, error } = useFeaturedSchools();
  const { toast } = useToast();

  // Show error toast only when error changes
  if (error) {
    toast({
      title: "Error",
      description: "Failed to load featured schools. Please try again later.",
      variant: "destructive",
    });
  }

  if (isLoading) {
    return (
      <section className="mb-16">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">Featured Schools</h2>
        </div>
        <div className="flex items-center justify-center p-8">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
        </div>
      </section>
    );
  }

  if (schools.length === 0) {
    return null;
  }

  return (
    <section className="mb-16">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Featured Schools</h2>
        <Link 
          to="/school"
          className="text-primary hover:text-primary/80 transition-colors"
        >
          View all
        </Link>
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
            {schools.map((school) => (
              <CarouselItem key={school.id} className="pl-4 basis-full md:basis-1/3 lg:basis-1/3">
                <SchoolCard school={school} />
              </CarouselItem>
            ))}
          </CarouselContent>
          <CarouselPrevious className="hidden md:flex absolute -left-4 top-1/2 -translate-y-1/2 h-8 w-8" />
          <CarouselNext className="hidden md:flex absolute -right-4 top-1/2 -translate-y-1/2 h-8 w-8" />
        </Carousel>
      </div>
    </section>
  );
};
