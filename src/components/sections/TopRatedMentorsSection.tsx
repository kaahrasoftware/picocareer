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
    created_at: new Date().toISOString(),
    user_type: "mentor",
    top_rated: true,
    skills: ["JavaScript", "React", "Node.js", "System Design"],
    tools: ["VS Code", "Git", "Docker", "AWS"],
    keywords: ["web development", "system design", "mentorship"],
    password: "123456789",
    email: "john.smith@example.com"
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
    created_at: new Date().toISOString(),
    user_type: "mentor",
    top_rated: true,
    skills: ["UI/UX", "Figma", "Design Systems", "User Research"],
    tools: ["Sketch", "Adobe XD", "InVision", "Principle"],
    keywords: ["product design", "user research", "prototyping"],
    password: "123456789",
    email: "sarah.johnson@example.com"
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
    created_at: new Date().toISOString(),
    user_type: "mentor",
    top_rated: true,
    skills: ["Python", "Machine Learning", "SQL", "Deep Learning"],
    tools: ["Jupyter", "TensorFlow", "PyTorch", "Pandas"],
    keywords: ["data analysis", "machine learning", "statistics"],
    password: "123456789",
    email: "michael.chen@example.com"
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