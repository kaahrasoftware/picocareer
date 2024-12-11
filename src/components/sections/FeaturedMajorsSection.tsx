import { useState } from "react";
import { MajorCard } from "@/components/MajorCard";
import { MajorListDialog } from "@/components/MajorListDialog";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";

interface MajorCardProps {
  id: number;
  title: string;
  description: string;
  users: string;
  imageUrl: string;
  relatedCareers: string[];
  requiredCourses: string[];
  averageGPA: string;
  category?: string;
  levelOfStudy?: string;
  createdAt?: string;
  featured?: boolean;
}

const fetchFeaturedMajors = async () => {
  const { data, error } = await supabase
    .from('majors')
    .select('*')
    .eq('featured', true);

  if (error) {
    throw error;
  }

  // Transform the data to match our component props
  return (data || []).map(major => ({
    id: major.id,
    title: major.title,
    description: major.description,
    users: major.users,
    imageUrl: major.image_url,
    relatedCareers: major.related_careers,
    requiredCourses: major.required_courses,
    averageGPA: major.average_gpa,
    category: major.category,
    levelOfStudy: major.level_of_study,
    createdAt: major.created_at,
    featured: major.featured
  })) as MajorCardProps[];
};

export const FeaturedMajorsSection = () => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  
  const { data: majors, isLoading, error } = useQuery({
    queryKey: ['featuredMajors'],
    queryFn: fetchFeaturedMajors,
  });

  if (isLoading) {
    return (
      <section className="mb-16">
        <h2 className="text-2xl font-bold mb-6">Featured Majors</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-48 bg-background/50 animate-pulse rounded-lg" />
          ))}
        </div>
      </section>
    );
  }

  if (error) {
    console.error('Error fetching featured majors:', error);
    return (
      <section className="mb-16">
        <h2 className="text-2xl font-bold mb-6">Featured Majors</h2>
        <div className="text-center text-muted-foreground">
          Failed to load featured majors. Please try again later.
        </div>
      </section>
    );
  }

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
          {majors?.map((major) => (
            <CarouselItem key={major.id} className="basis-1/3">
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
        majors={majors || []}
      />
    </section>
  );
};