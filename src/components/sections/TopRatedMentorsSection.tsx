
import { useState } from "react";
import { MentorCard } from "@/components/MentorCard";
import { useTopRatedMentors } from "@/hooks/useTopRatedMentors";
import { Link } from "react-router-dom";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";

export const TopRatedMentorsSection = () => {
  const { data: topMentors = [], isLoading } = useTopRatedMentors();

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (topMentors.length === 0) {
    return null; // Don't show the section if there are no top mentors
  }

  return (
    <section className="mb-16 TopRatedMentorsSection">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Top Rated Mentors</h2>
        <Link 
          to="/mentor"
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
            {topMentors.map((mentor) => (
              <CarouselItem key={mentor.id} className="pl-4 basis-full md:basis-1/3">
                <MentorCard 
                  id={mentor.id}
                  name={mentor.name}
                  position={mentor.career_title}
                  company={mentor.company}
                  location={mentor.location}
                  skills={mentor.skills}
                  keywords={mentor.keywords}
                  rating={mentor.rating}
                  totalRatings={mentor.totalRatings}
                  avatarUrl={mentor.imageUrl}
                  topMentor={mentor.top_mentor}
                />
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
