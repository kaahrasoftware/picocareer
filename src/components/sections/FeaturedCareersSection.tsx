import { useState } from "react";
import { CareerCard } from "@/components/CareerCard";
import { CareerListDialog } from "@/components/CareerListDialog";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";

const hardcodedCareers = [
  {
    id: 1,
    title: "Software Engineer",
    description: "Design and develop software applications and systems",
    users: "10,000+",
    salary: "$120,000/year",
    image_url: "/placeholder.svg",
    related_majors: ["Computer Science", "Software Engineering", "Information Technology"],
    related_careers: ["Web Developer", "DevOps Engineer", "Systems Architect"],
    skills: ["JavaScript", "Python", "Problem Solving", "System Design"],
    category: "Technology",
    level_of_study: "Bachelor's Degree",
    created_at: new Date().toISOString(),
    featured: true
  },
  {
    id: 2,
    title: "Data Scientist",
    description: "Analyze complex data sets to help guide business decisions",
    users: "8,000+",
    salary: "$115,000/year",
    image_url: "/placeholder.svg",
    related_majors: ["Data Science", "Statistics", "Mathematics"],
    related_careers: ["Data Analyst", "Machine Learning Engineer", "Business Intelligence Analyst"],
    skills: ["Python", "SQL", "Machine Learning", "Statistics"],
    category: "Technology",
    level_of_study: "Master's Degree",
    created_at: new Date().toISOString(),
    featured: true
  },
  {
    id: 3,
    title: "UX Designer",
    description: "Create user-friendly interfaces and experiences",
    users: "6,000+",
    salary: "$95,000/year",
    image_url: "/placeholder.svg",
    related_majors: ["Design", "Psychology", "Human-Computer Interaction"],
    related_careers: ["UI Designer", "Product Designer", "Interaction Designer"],
    skills: ["User Research", "Wireframing", "Prototyping", "Design Systems"],
    category: "Design",
    level_of_study: "Bachelor's Degree",
    created_at: new Date().toISOString(),
    featured: true
  },
  {
    id: 4,
    title: "Product Manager",
    description: "Lead product development and strategy",
    users: "7,500+",
    salary: "$125,000/year",
    image_url: "/placeholder.svg",
    related_majors: ["Business", "Computer Science", "Marketing"],
    related_careers: ["Program Manager", "Product Owner", "Business Analyst"],
    skills: ["Strategy", "Leadership", "Analytics", "Communication"],
    category: "Management",
    level_of_study: "Bachelor's Degree",
    created_at: new Date().toISOString(),
    featured: true
  }
];

export const FeaturedCareersSection = () => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  return (
    <section className="mb-16">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Featured Careers</h2>
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
          {hardcodedCareers.map((career, index) => (
            <CarouselItem key={index} className="basis-1/3">
              <CareerCard {...career} />
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselPrevious className="hidden md:flex" />
        <CarouselNext className="hidden md:flex" />
      </Carousel>
      <CareerListDialog
        isOpen={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        careers={hardcodedCareers}
      />
    </section>
  );
};