import { useState } from "react";
import { MentorCard } from "@/components/MentorCard";
import { MentorListDialog } from "@/components/MentorListDialog";
import { useTopRatedMentors } from "@/hooks/useTopRatedMentors";
import type { Tables } from "@/integrations/supabase/types";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";

interface TopRatedMentorsSectionProps {
  initialMentors?: Tables<"profiles">[];
}

export const TopRatedMentorsSection = ({ initialMentors }: TopRatedMentorsSectionProps) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { data: mentors = initialMentors ?? [], isLoading } = useTopRatedMentors();

  if (isLoading && !initialMentors) {
    return <div>Loading...</div>;
  }

  return (
    <section className="mb-16">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Top Rated Mentors</h2>
        <button 
          onClick={() => setIsDialogOpen(true)}
          className="text-primary hover:text-primary/80 transition-colors"
        >
          View all
        </button>
      </div>
      <div className="relative -mx-8">
        <Carousel
          opts={{
            align: "start",
            loop: true,
          }}
          className="w-full px-8"
        >
          <CarouselContent className="-ml-4">
            {mentors.map((mentor) => (
              <CarouselItem key={mentor.id} className="pl-4 basis-full md:basis-1/3">
                <MentorCard {...mentor} />
              </CarouselItem>
            ))}
          </CarouselContent>
          <CarouselPrevious className="hidden md:flex absolute -left-4 top-1/2 -translate-y-1/2 h-8 w-8" />
          <CarouselNext className="hidden md:flex absolute -right-4 top-1/2 -translate-y-1/2 h-8 w-8" />
        </Carousel>
      </div>
      <MentorListDialog
        isOpen={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        mentors={mentors}
      />
    </section>
  );
};