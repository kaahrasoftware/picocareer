import { useState } from "react";
import { MentorCard } from "@/components/MentorCard";
import { MentorListDialog } from "@/components/MentorListDialog";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";

const TOP_RATED_MENTORS = [
  {
    id: "1",
    title: "Senior Software Engineer",
    company: "Google",
    image_url: "/placeholder.svg",
    full_name: "John Smith",
    username: "johnsmith",
    bio: "10+ years of experience in software development",
    position: "Tech Lead",
    education: "MS Computer Science",
    sessions_held: "50",
    stats: {
      mentees: "120",
      connected: "95",
      recordings: "45"
    },
    user_type: "mentor",
    top_rated: true,
    skills: ["React", "Node.js", "System Design"],
    tools: ["VS Code", "Git", "Docker"],
    keywords: ["software", "engineering", "leadership"],
    email: "john@example.com",
    password: "123456789",
    created_at: new Date().toISOString()
  },
  {
    id: "2",
    title: "Product Manager",
    company: "Microsoft",
    image_url: "/placeholder.svg",
    full_name: "Sarah Johnson",
    username: "sarahj",
    bio: "Experienced in product strategy and development",
    position: "Senior PM",
    education: "MBA",
    sessions_held: "35",
    stats: {
      mentees: "85",
      connected: "70",
      recordings: "30"
    },
    user_type: "mentor",
    top_rated: true,
    skills: ["Product Strategy", "Agile", "User Research"],
    tools: ["Jira", "Figma", "Amplitude"],
    keywords: ["product", "management", "strategy"],
    email: "sarah@example.com",
    password: "123456789",
    created_at: new Date().toISOString()
  },
  {
    id: "3",
    title: "Data Science Lead",
    company: "Amazon",
    image_url: "/placeholder.svg",
    full_name: "Michael Chen",
    username: "michaelc",
    bio: "Expert in machine learning and data analytics",
    position: "Technical Lead",
    education: "PhD Statistics",
    sessions_held: "40",
    stats: {
      mentees: "95",
      connected: "80",
      recordings: "35"
    },
    user_type: "mentor",
    top_rated: true,
    skills: ["Machine Learning", "Python", "Statistics"],
    tools: ["Python", "TensorFlow", "SQL"],
    keywords: ["data", "science", "analytics"],
    email: "michael@example.com",
    password: "123456789",
    created_at: new Date().toISOString()
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
          {TOP_RATED_MENTORS.map((mentor) => (
            <CarouselItem key={mentor.id} className="basis-1/3">
              <MentorCard {...mentor} />
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselPrevious className="hidden md:flex" />
        <CarouselNext className="hidden md:flex" />
      </Carousel>
      <MentorListDialog
        isOpen={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        mentors={TOP_RATED_MENTORS}
      />
    </section>
  );
};