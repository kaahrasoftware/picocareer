
import { useState } from "react";
import { ModernMentorCard } from "@/components/cards/ModernMentorCard";
import { useTopRatedMentors } from "@/hooks/useTopRatedMentors";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight, Users } from "lucide-react";
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
    return (
      <section className="py-16 bg-gradient-to-r from-blue-50 to-purple-50/30">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <div className="flex items-center justify-center">
              <div className="w-8 h-8 border-4 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
            <p className="text-gray-500 mt-4">Loading top-rated mentors...</p>
          </div>
        </div>
      </section>
    );
  }

  if (topMentors.length === 0) {
    return null;
  }

  return (
    <section className="py-16 bg-gradient-to-r from-blue-50 to-purple-50/30">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 bg-purple-100 text-purple-700 px-4 py-2 rounded-full text-sm font-medium mb-6">
            <Users className="w-4 h-4" />
            Expert Mentors
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Top-Rated Mentors</h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Connect with our highest-rated mentors who have helped hundreds of students achieve their goals
          </p>
        </div>
        
        <div className="relative">
          <Carousel
            opts={{
              align: "start",
              loop: true,
            }}
            className="w-full"
          >
            <CarouselContent className="-ml-4">
              {topMentors.map((mentor) => (
                <CarouselItem key={mentor.id} className="pl-4 basis-full md:basis-1/2 lg:basis-1/3">
                  <ModernMentorCard 
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
            <CarouselPrevious className="hidden md:flex" />
            <CarouselNext className="hidden md:flex" />
          </Carousel>
        </div>
        
        <div className="text-center mt-12">
          <Button asChild size="lg" className="group">
            <Link to="/mentor" className="flex items-center gap-2">
              View All Mentors
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
};
