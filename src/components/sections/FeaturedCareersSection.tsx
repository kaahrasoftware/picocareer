import { useState } from "react";
import { CareerCard } from "@/components/CareerCard";
import { CareerListDialog } from "@/components/CareerListDialog";
import { useFeaturedCareers } from "@/hooks/useFeaturedCareers";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";

export const FeaturedCareersSection = () => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { data: careers = [], isLoading } = useFeaturedCareers();

  if (isLoading) {
    return <div>Loading...</div>;
  }

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
          {careers.map((career) => (
            <CarouselItem key={career.id} className="basis-1/3">
              <CareerCard 
                title={career.title}
                description={career.description}
                users={`${Math.floor(Math.random() * 900 + 100)}K`}
                salary={career.salary_range || "Competitive"}
                imageUrl={career.image_url || "https://images.unsplash.com/photo-1498050108023-c5249f4df085"}
                relatedMajors={[]}
                relatedCareers={[]}
                skills={career.required_skills || []}
              />
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselPrevious className="hidden md:flex" />
        <CarouselNext className="hidden md:flex" />
      </Carousel>
      <CareerListDialog
        isOpen={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        careers={careers}
      />
    </section>
  );
};