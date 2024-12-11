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
    title: "Sr. UI/UX Designer",
    company: "Microsoft Inc.",
    imageUrl: "https://images.unsplash.com/photo-1494790108377-be9c29b29330",
    name: "Anya Greiner",
    stats: {
      mentees: "495",
      connected: "579K",
      recordings: "57K",
    },
    username: "anyagreiner",
    education: "Master's",
    sessionsHeld: "120",
    position: "Senior",
  },
  {
    title: "Chief Information Security Officer",
    company: "Lenovo",
    imageUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d",
    name: "Jeffrey Egoyo",
    stats: {
      mentees: "495",
      connected: "579K",
      recordings: "57K",
    },
    username: "jeffegoyo",
    education: "PhD",
    sessionsHeld: "85",
    position: "Principal",
  },
  {
    title: "Computer Science",
    company: "Georgia Tech",
    imageUrl: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80",
    name: "Anya Greiner",
    stats: {
      mentees: "495",
      connected: "579K",
      recordings: "57",
    },
    username: "anyagreiner",
    education: "PhD",
    sessionsHeld: "45",
    position: "Lead",
  },
  {
    title: "Pharmacist",
    company: "Walmart",
    imageUrl: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e",
    name: "Gary Greiner",
    stats: {
      mentees: "495",
      connected: "579K",
      recordings: "57K",
    },
    username: "garygreiner",
    education: "Bachelor's",
    sessionsHeld: "25",
    position: "Senior",
  },
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