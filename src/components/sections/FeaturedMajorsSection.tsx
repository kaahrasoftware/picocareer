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
    id: "1",
    title: "Computer Science",
    description: "Study the theory and practice of computing, programming, and software development.",
    users: "892.1K",
    imageUrl: "https://images.unsplash.com/photo-1517694712202-14dd9538aa97",
    relatedCareers: ["Software Engineer", "Data Scientist", "Systems Architect"],
    requiredCourses: ["Data Structures", "Algorithms", "Computer Architecture", "Operating Systems"],
    averageGPA: "3.3",
    fieldOfStudy: "STEM",
    degreeLevel: "Bachelor's",
    duration: "4 years",
    careerOpportunities: ["Software Development", "AI/ML", "Cybersecurity"],
    featured: true
  },
  {
    id: "2",
    title: "Business Administration",
    description: "Learn fundamental business principles and management strategies.",
    users: "567.8K",
    imageUrl: "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40",
    relatedCareers: ["Business Analyst", "Project Manager", "Consultant"],
    requiredCourses: ["Economics", "Finance", "Marketing", "Management"],
    averageGPA: "3.2",
    fieldOfStudy: "Business",
    degreeLevel: "Bachelor's",
    duration: "4 years",
    careerOpportunities: ["Business Management", "Consulting", "Entrepreneurship"],
    featured: true
  },
  {
    id: "3",
    title: "Data Science",
    description: "Combine statistics, programming, and domain expertise to extract insights from data.",
    users: "234.5K",
    imageUrl: "https://images.unsplash.com/photo-1551288049-bebda4e38f71",
    relatedCareers: ["Data Scientist", "Machine Learning Engineer", "Data Analyst"],
    requiredCourses: ["Statistics", "Machine Learning", "Data Mining", "Programming"],
    averageGPA: "3.4",
    fieldOfStudy: "STEM",
    degreeLevel: "Master's",
    duration: "2 years",
    careerOpportunities: ["Data Analysis", "Machine Learning", "Research"],
    featured: true
  },
  {
    id: "4",
    title: "Psychology",
    description: "Study human behavior, mental processes, and their applications.",
    users: "456.7K",
    imageUrl: "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d",
    relatedCareers: ["Clinical Psychologist", "Counselor", "Research Psychologist"],
    requiredCourses: ["Research Methods", "Cognitive Psychology", "Social Psychology", "Statistics"],
    averageGPA: "3.5",
    fieldOfStudy: "Social Sciences",
    degreeLevel: "Bachelor's",
    duration: "4 years",
    careerOpportunities: ["Clinical Practice", "Research", "Counseling"],
    featured: true
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