import { useState } from "react";
import { MentorCard } from "@/components/MentorCard";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";

const hardcodedMentors = [
  {
    id: "1",
    title: "Senior Software Engineer",
    company: "Google",
    image_url: "/placeholder.svg",
    name: "John Smith",
    username: "johnsmith",
    bio: "10+ years of experience in software development",
    position: "Tech Lead",
    education: "MS Computer Science",
    sessions_held: "50",
    stats: {
      mentees: "100",
      connected: "4.9",
      recordings: "45"
    },
    skills: ["JavaScript", "React", "Node.js"],
    tools: ["VS Code", "Git", "Docker"],
    keywords: ["web development", "system design", "mentorship"]
  },
  {
    id: "2",
    title: "Product Design Lead",
    company: "Apple",
    image_url: "/placeholder.svg",
    name: "Sarah Johnson",
    username: "sarahj",
    bio: "Passionate about creating intuitive user experiences",
    position: "Design Manager",
    education: "BFA Design",
    sessions_held: "35",
    stats: {
      mentees: "75",
      connected: "4.8",
      recordings: "30"
    },
    skills: ["UI/UX", "Figma", "Design Systems"],
    tools: ["Sketch", "Adobe XD", "InVision"],
    keywords: ["product design", "user research", "prototyping"]
  },
  {
    id: "3",
    title: "Data Science Manager",
    company: "Amazon",
    image_url: "/placeholder.svg",
    name: "Michael Chen",
    username: "michaelc",
    bio: "Helping others break into data science",
    position: "Team Lead",
    education: "PhD Statistics",
    sessions_held: "40",
    stats: {
      mentees: "85",
      connected: "4.7",
      recordings: "35"
    },
    skills: ["Python", "Machine Learning", "SQL"],
    tools: ["Jupyter", "TensorFlow", "PyTorch"],
    keywords: ["data analysis", "machine learning", "statistics"]
  }
];

export const TopRatedMentorsSection = () => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  return (
    <section className="mb-16">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Top Rated Mentors</h2>
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
          {hardcodedMentors.map((mentor) => (
            <CarouselItem key={mentor.id} className="basis-1/3">
              <MentorCard {...mentor} />
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselPrevious className="hidden md:flex" />
        <CarouselNext className="hidden md:flex" />
      </Carousel>
    </section>
  );
};