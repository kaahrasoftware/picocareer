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

const featuredCareers = [
  {
    id: "1",
    title: "Software Engineer",
    description: "Design and develop scalable software solutions using modern technologies and best practices.",
    users: "892.1K",
    salary: "$90K - $150K",
    imageUrl: "https://images.unsplash.com/photo-1498050108023-c5249f4df085",
    relatedMajors: ["Computer Science", "Software Engineering"],
    relatedCareers: ["Full Stack Developer", "DevOps Engineer", "Mobile Developer"],
    skills: ["JavaScript", "Python", "System Design", "Cloud Computing"],
    required_education: ["Bachelor's Degree", "Master's Degree"],
    required_tools: ["Git", "Docker", "AWS", "VS Code"],
    job_outlook: "Excellent growth potential with 22% increase expected by 2030",
    industry: "Technology",
    work_environment: "Hybrid/Remote",
    average_salary: 120000,
    growth_potential: "High",
    featured: true
  },
  {
    id: "2",
    title: "Data Scientist",
    description: "Analyze complex data sets to help organizations make better decisions.",
    users: "234.6K",
    salary: "$85K - $140K",
    imageUrl: "https://images.unsplash.com/photo-1551288049-bebda4e38f71",
    relatedMajors: ["Statistics", "Computer Science", "Mathematics"],
    relatedCareers: ["Machine Learning Engineer", "Data Analyst", "Research Scientist"],
    skills: ["Python", "R", "Machine Learning", "Statistics"],
    required_education: ["Master's Degree", "PhD"],
    required_tools: ["Python", "R Studio", "TensorFlow", "SQL"],
    job_outlook: "Strong demand with 31% growth projected",
    industry: "Technology/Research",
    work_environment: "Hybrid",
    average_salary: 115000,
    growth_potential: "Very High",
    featured: true
  },
  {
    id: "3",
    title: "UX/UI Designer",
    description: "Create intuitive and engaging user experiences for digital products.",
    users: "156.3K",
    salary: "$75K - $120K",
    imageUrl: "https://images.unsplash.com/photo-1561070791-2526d30994b5",
    relatedMajors: ["Design", "Human-Computer Interaction", "Psychology"],
    relatedCareers: ["Product Designer", "Interaction Designer", "Visual Designer"],
    skills: ["User Research", "Wireframing", "Prototyping", "Visual Design"],
    required_education: ["Bachelor's Degree"],
    required_tools: ["Figma", "Sketch", "Adobe XD", "InVision"],
    job_outlook: "Growing demand across industries",
    industry: "Technology/Design",
    work_environment: "Hybrid/Office",
    average_salary: 95000,
    growth_potential: "High",
    featured: true
  },
  {
    id: "4",
    title: "Product Manager",
    description: "Lead product development and strategy to deliver successful solutions.",
    users: "178.9K",
    salary: "$100K - $160K",
    imageUrl: "https://images.unsplash.com/photo-1460925895917-afdab827c52f",
    relatedMajors: ["Business Administration", "Computer Science", "Engineering"],
    relatedCareers: ["Program Manager", "Product Owner", "Business Analyst"],
    skills: ["Strategy", "Leadership", "Analytics", "Communication"],
    required_education: ["Bachelor's Degree", "MBA"],
    required_tools: ["Jira", "Confluence", "Analytics Tools", "Slack"],
    job_outlook: "Strong growth in tech and other sectors",
    industry: "Technology/Business",
    work_environment: "Hybrid",
    average_salary: 130000,
    growth_potential: "High",
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
          {featuredCareers.map((career, index) => (
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
        careers={featuredCareers}
      />
    </section>
  );
};