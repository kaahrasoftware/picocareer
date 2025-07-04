
import React from 'react';
import { useFeaturedSchools } from '@/hooks/useFeaturedSchools';
import { ModernSchoolCard } from '@/components/cards/ModernSchoolCard';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";

export function FeaturedSchoolsSection() {
  const { data: schools = [], isLoading } = useFeaturedSchools(6);

  if (isLoading) {
    return (
      <div className="text-center py-12">
        <div className="flex items-center justify-center">
          <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
        <p className="text-gray-500 mt-4">Loading featured schools...</p>
      </div>
    );
  }

  if (schools.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">No featured schools available at the moment.</p>
      </div>
    );
  }

  return (
    <div className="relative">
      <Carousel
        opts={{
          align: "start",
          loop: true,
        }}
        className="w-full"
      >
        <CarouselContent className="-ml-4">
          {schools.map((school) => (
            <CarouselItem key={school.id} className="pl-4 basis-full md:basis-1/2 lg:basis-1/3">
              <ModernSchoolCard school={school} />
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselPrevious className="hidden md:flex" />
        <CarouselNext className="hidden md:flex" />
      </Carousel>
    </div>
  );
}
