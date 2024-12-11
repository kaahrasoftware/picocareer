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
    title: "Software Engineer",
    description: "Design and develop software applications and systems",
    users: "10,000+",
    salary: "$120,000/year",
    imageUrl: "/placeholder.svg",
    relatedMajors: ["Computer Science", "Software Engineering"],
    relatedCareers: ["Web Developer", "DevOps Engineer"],
    skills: ["JavaScript", "Python", "Problem Solving"]
  },
  {
    title: "Data Scientist",
    description: "Analyze complex data sets to help guide business decisions",
    users: "8,000+",
    salary: "$115,000/year",
    imageUrl: "/placeholder.svg",
    relatedMajors: ["Data Science", "Statistics"],
    relatedCareers: ["Data Analyst", "Machine Learning Engineer"],
    skills: ["Python", "SQL", "Machine Learning"]
  },
  {
    title: "UX Designer",
    description: "Create user-friendly interfaces and experiences",
    users: "6,000+",
    salary: "$95,000/year",
    imageUrl: "/placeholder.svg",
    relatedMajors: ["Design", "Psychology"],
    relatedCareers: ["UI Designer", "Product Designer"],
    skills: ["User Research", "Wireframing", "Prototyping"]
  },
  {
    title: "Product Manager",
    description: "Lead product development and strategy",
    users: "7,500+",
    salary: "$125,000/year",
    imageUrl: "/placeholder.svg",
    relatedMajors: ["Business", "Computer Science"],
    relatedCareers: ["Program Manager", "Product Owner"],
    skills: ["Strategy", "Leadership", "Analytics"]
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