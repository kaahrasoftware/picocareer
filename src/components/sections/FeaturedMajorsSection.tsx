import { useState } from "react";
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
import type { Major } from "@/types/database/majors";

export const FeaturedMajorsSection = () => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { data: majorsData = [], isLoading } = useFeaturedMajors();

  if (isLoading) {
    return <div>Loading...</div>;
  }

  // Transform the majors data to match the expected format
  const majors = majorsData.map((major: Major) => ({
    title: major.title,
    description: major.description,
    imageUrl: major.image_url || '',
    users: '0',
    relatedCareers: major.career_opportunities || [],
    requiredCourses: major.required_courses || [],
    averageGPA: 'N/A',
    fieldOfStudy: major.field_of_study,
    degreeLevel: major.degree_level
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