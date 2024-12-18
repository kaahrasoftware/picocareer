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

export const FeaturedMajorsSection = () => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { data: majorsData = [], isLoading, refetch } = useFeaturedMajors();

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

  const majors = majorsData.map((major: Major) => ({
    title: major.title,
    description: major.description,
    users: major.profiles_count?.toString() || '0',
    relatedCareers: major.career_opportunities || [],
    requiredCourses: major.common_courses || [],
    averageGPA: major.gpa_expectations?.toString() || 'N/A',
    fieldOfStudy: major.degree_levels?.join(", ") || 'N/A',
    potential_salary: major.potential_salary,
    skill_match: major.skill_match,
    tools_knowledge: major.tools_knowledge,
    common_courses: major.common_courses,
    profiles_count: major.profiles_count || 0
  }));

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