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

const featuredMajors = [
  {
    title: "Statistics",
    description: "Statistics involves analyzing data to understand patterns, make predictions, and inform decision-making.",
    users: "234.6K",
    imageUrl: "https://images.unsplash.com/photo-1551288049-bebda4e38f71",
    relatedCareers: ["Data Scientist", "Business Analyst", "Research Statistician"],
    requiredCourses: ["Calculus", "Linear Algebra", "Probability Theory", "Statistical Methods"],
    averageGPA: "3.4",
    fieldOfStudy: "stem",
    degreeLevel: "bachelors"
  },
  {
    title: "Business Administration",
    description: "Managing operations, finances, and strategies for organizational success and growth in commerce.",
    users: "56.7M",
    imageUrl: "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40",
    relatedCareers: ["Business Manager", "Management Consultant", "Entrepreneur"],
    requiredCourses: ["Economics", "Marketing", "Finance", "Business Ethics"],
    averageGPA: "3.2",
    fieldOfStudy: "business",
    degreeLevel: "bachelors"
  },
  {
    title: "Nursing",
    description: "Learn to provide essential healthcare services and support patient well-being through medical expertise.",
    users: "56.7M",
    imageUrl: "https://images.unsplash.com/photo-1584982751601-97dcc096659c",
    relatedCareers: ["Registered Nurse", "Nurse Practitioner", "Clinical Specialist"],
    requiredCourses: ["Anatomy", "Pharmacology", "Patient Care", "Medical Ethics"],
    averageGPA: "3.5",
    fieldOfStudy: "stem",
    degreeLevel: "bachelors"
  },
  {
    title: "Computer Science",
    description: "Study algorithms, programming, and computational systems to solve complex problems.",
    users: "892.1K",
    imageUrl: "https://images.unsplash.com/photo-1517694712202-14dd9538aa97",
    relatedCareers: ["Software Engineer", "Data Scientist", "Systems Architect"],
    requiredCourses: ["Programming", "Data Structures", "Algorithms", "Computer Architecture"],
    averageGPA: "3.3",
    fieldOfStudy: "stem",
    degreeLevel: "bachelors"
  },
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
          {featuredMajors.map((major, index) => (
            <CarouselItem key={index} className="basis-1/3">
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
        majors={featuredMajors}
      />
    </section>
  );
};