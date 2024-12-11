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

const topRatedMentors = [
  {
    id: "1",
    title: "Senior Software Engineer",
    company: "Google",
    imageUrl: "https://images.unsplash.com/photo-1494790108377-be9c29b29330",
    name: "Sarah Chen",
    stats: {
      mentees: "495",
      connected: "579K",
      recordings: "57"
    },
    username: "sarahchen",
    education: "Master's in Computer Science",
    position: "Senior",
    bio: "Passionate about helping others grow in tech. 10+ years of experience in software development.",
    skills: ["JavaScript", "Python", "System Design"],
    tools_used: ["React", "Node.js", "AWS"],
    years_of_experience: 10,
    featured: true
  },
  {
    id: "2",
    title: "Product Design Lead",
    company: "Apple",
    imageUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d",
    name: "David Kim",
    stats: {
      mentees: "382",
      connected: "428K",
      recordings: "43"
    },
    username: "davidkim",
    education: "BFA in Design",
    position: "Lead",
    bio: "Helping designers level up their skills and build amazing products.",
    skills: ["UI Design", "UX Research", "Product Strategy"],
    tools_used: ["Figma", "Sketch", "Adobe XD"],
    years_of_experience: 8,
    featured: true
  },
  {
    id: "3",
    title: "Data Science Manager",
    company: "Netflix",
    imageUrl: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80",
    name: "Emily Rodriguez",
    stats: {
      mentees: "289",
      connected: "356K",
      recordings: "38"
    },
    username: "emilyrod",
    education: "PhD in Statistics",
    position: "Manager",
    bio: "Passionate about data science and machine learning. Love helping others break into the field.",
    skills: ["Python", "Machine Learning", "Statistics"],
    tools_used: ["PyTorch", "TensorFlow", "SQL"],
    years_of_experience: 7,
    featured: true
  },
  {
    id: "4",
    title: "Engineering Director",
    company: "Microsoft",
    imageUrl: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e",
    name: "Michael Zhang",
    stats: {
      mentees: "521",
      connected: "682K",
      recordings: "62"
    },
    username: "michaelzhang",
    education: "Master's in Software Engineering",
    position: "Director",
    bio: "Tech leader with a passion for mentoring and building great teams.",
    skills: ["Leadership", "System Architecture", "Cloud Computing"],
    tools_used: ["Azure", "Kubernetes", "Docker"],
    years_of_experience: 15,
    featured: true
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
          {topRatedMentors.map((mentor, index) => (
            <CarouselItem key={index} className="basis-1/3">
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
        mentors={topRatedMentors}
      />
    </section>
  );
};