import { useState } from "react";
import { MentorCard } from "@/components/MentorCard";
import { MentorListDialog } from "@/components/MentorListDialog";
import { useTopRatedMentors } from "@/hooks/useTopRatedMentors";
import { Link } from "react-router-dom";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import Autoplay from "embla-carousel-autoplay";

export const TopRatedMentorsSection = () => {
  const { data: mentors = [], isLoading } = useTopRatedMentors();

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <section className="mb-16">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Top Rated Mentors</h2>
        <Link 
          to="/mentor"
          className="text-primary hover:text-primary/80 transition-colors"
        >
          View all
        </Link>
      </div>
      <div className="relative -mx-12">
        <Carousel
          opts={{
            align: "start",
            loop: true,
          }}
          plugins={[
            Autoplay({
              delay: 6000,
              stopOnInteraction: true,
              stopOnMouseEnter: true,
            }),
          ]}
          className="w-full"
        >
          <CarouselContent>
            {mentors.map((mentor) => (
              <CarouselItem key={mentor.id} className="basis-1/3">
                <MentorCard {...mentor} />
              </CarouselItem>
            ))}
          </CarouselContent>
          <CarouselPrevious className="hidden md:flex absolute -left-6 top-1/2 -translate-y-1/2 h-8 w-8" />
          <CarouselNext className="hidden md:flex absolute -right-6 top-1/2 -translate-y-1/2 h-8 w-8" />
        </Carousel>
      </div>
    </section>
  );
};