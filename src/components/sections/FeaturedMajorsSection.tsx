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
import Autoplay from "embla-carousel-autoplay";
import type { Major } from "@/types/database/majors";
import { supabase } from "@/integrations/supabase/client";

export const FeaturedMajorsSection = () => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { data: majorsData = [], isLoading, refetch } = useFeaturedMajors();

  // Set up real-time updates for profile counts
  useEffect(() => {
    // Initial fetch
    refetch();

    // Set up interval for periodic updates
    const intervalId = setInterval(() => {
      console.log("Refreshing majors data...");
      refetch();
    }, 10000); // Refresh every 10 seconds

    // Clean up on unmount
    return () => clearInterval(intervalId);
  }, [refetch]);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  // Transform the majors data to match the expected format
  const majors = majorsData.map((major: Major) => ({
    title: major.title,
    description: major.description,
    imageUrl: major.image_url || '',
    users: major.profiles_count?.toString() || '0',
    relatedCareers: major.career_opportunities || [],
    requiredCourses: major.required_courses || [],
    averageGPA: 'N/A',
    fieldOfStudy: major.field_of_study,
    degreeLevel: major.degree_level,
    potential_salary: major.potential_salary,
    skill_match: major.skill_match,
    tools_knowledge: major.tools_knowledge,
    common_courses: major.common_courses,
    profiles_count: major.profiles_count || 0
  }));

  console.log("Transformed majors data:", majors); // Debug log

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
      <Carousel
        opts={{
          align: "start",
          loop: true,
        }}
        plugins={[
          Autoplay({
            delay: 5000,
            stopOnInteraction: true,
            stopOnMouseEnter: true,
          }),
        ]}
        className="w-full"
      >
        <CarouselContent>
          {majors.map((major) => (
            <CarouselItem key={major.title} className="basis-1/3">
              <MajorCard {...major} />
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselPrevious className="hidden md:flex" />
        <CarouselNext className="hidden md:flex" />
      </Carousel>
      <MajorListDialog
        isOpen={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        majors={majors}
      />
    </section>
  );
}