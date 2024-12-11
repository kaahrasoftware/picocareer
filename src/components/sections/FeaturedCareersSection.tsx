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

const FEATURED_CAREERS = [
  {
    id: 1,
    title: "Software Engineer",
    description: "Design and develop software applications",
    users: "15K",
    salary: "$120K/year",
    image_url: "/placeholder.svg",
    related_majors: ["Computer Science", "Software Engineering"],
    related_careers: ["Full Stack Developer", "DevOps Engineer"],
    skills: ["JavaScript", "Python", "Cloud Computing"],
  },
  {
    id: 2,
    title: "Data Scientist",
    description: "Analyze complex data sets to drive business decisions",
    users: "10K",
    salary: "$115K/year",
    image_url: "/placeholder.svg",
    related_majors: ["Data Science", "Statistics"],
    related_careers: ["Data Analyst", "Machine Learning Engineer"],
    skills: ["Python", "SQL", "Machine Learning"],
  },
  {
    id: 3,
    title: "UX Designer",
    description: "Create intuitive and engaging user experiences",
    users: "8K",
    salary: "$95K/year",
    image_url: "/placeholder.svg",
    related_majors: ["Design", "Human-Computer Interaction"],
    related_careers: ["UI Designer", "Product Designer"],
    skills: ["User Research", "Wireframing", "Prototyping"],
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
          {FEATURED_CAREERS.map((career) => (
            <CarouselItem key={career.id} className="basis-1/3">
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
        careers={FEATURED_CAREERS}
      />
    </section>
  );
};