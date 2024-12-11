import { useState } from "react";
import { MajorCard } from "@/components/MajorCard";
import { MajorListDialog } from "@/components/MajorListDialog";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";

const FEATURED_MAJORS = [
  {
    id: 1,
    title: "Computer Science",
    description: "Study the theory and practice of computing",
    users: "20K",
    imageUrl: "/placeholder.svg",
    relatedCareers: ["Software Engineer", "Data Scientist", "Systems Architect"],
    requiredCourses: ["Algorithms", "Data Structures", "Operating Systems"],
    averageGPA: "3.5"
  },
  {
    id: 2,
    title: "Business Administration",
    description: "Learn fundamental business principles and management",
    users: "25K",
    imageUrl: "/placeholder.svg",
    relatedCareers: ["Business Analyst", "Project Manager", "Consultant"],
    requiredCourses: ["Economics", "Marketing", "Finance"],
    averageGPA: "3.3"
  },
  {
    id: 3,
    title: "Psychology",
    description: "Explore human behavior and mental processes",
    users: "18K",
    imageUrl: "/placeholder.svg",
    relatedCareers: ["Clinical Psychologist", "Counselor", "Research Analyst"],
    requiredCourses: ["Research Methods", "Statistics", "Cognitive Psychology"],
    averageGPA: "3.4"
  }
];

export const FeaturedMajorsSection = () => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  return (
    <section className="mb-16">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Featured Majors</h2>
        <button 
          onClick={() => setIsDialogOpen(true)}
          className="text-kahra-primary hover:text-kahra-primary/80 transition-colors"
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
          {FEATURED_MAJORS.map((major) => (
            <CarouselItem key={major.id} className="basis-1/3">
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
        majors={FEATURED_MAJORS}
      />
    </section>
  );
};