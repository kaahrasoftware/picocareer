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
import { Major } from "@/integrations/supabase/types/major.types";

const FEATURED_MAJORS: Major[] = [
  {
    id: 1,
    title: "Computer Science",
    description: "Study the theory and practice of computing",
    users: "20K",
    image_url: "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=800&auto=format&fit=crop&q=60",
    related_careers: ["Software Engineer", "Data Scientist", "Systems Architect"],
    required_courses: ["Algorithms", "Data Structures", "Operating Systems"],
    average_gpa: "3.5",
    category: "science",
    level_of_study: "undergraduate",
    created_at: new Date().toISOString()
  },
  {
    id: 2,
    title: "Business Administration",
    description: "Learn fundamental business principles and management",
    users: "25K",
    image_url: "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=800&auto=format&fit=crop&q=60",
    related_careers: ["Business Analyst", "Project Manager", "Consultant"],
    required_courses: ["Economics", "Marketing", "Finance"],
    average_gpa: "3.3",
    category: "business",
    level_of_study: "undergraduate",
    created_at: new Date().toISOString()
  },
  {
    id: 3,
    title: "Psychology",
    description: "Explore human behavior and mental processes",
    users: "18K",
    image_url: "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=800&auto=format&fit=crop&q=60",
    related_careers: ["Clinical Psychologist", "Counselor", "Research Analyst"],
    required_courses: ["Research Methods", "Statistics", "Cognitive Psychology"],
    average_gpa: "3.4",
    category: "science",
    level_of_study: "undergraduate",
    created_at: new Date().toISOString()
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