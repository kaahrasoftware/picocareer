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
import Autoplay from "embla-carousel-autoplay";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function Career() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [industryFilter, setIndustryFilter] = useState("all");
  const [salaryFilter, setSalaryFilter] = useState("all");

  const { data: careers = [], isLoading } = useQuery({
    queryKey: ["careers"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("careers")
        .select("*")
        .eq('status', 'Approved')
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data;
    },
  });

  const featuredCareers = careers.filter(career => career.featured);
  
  const filteredCareers = careers.filter((career) => {
    const matchesSearch = career.title.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesIndustry = industryFilter === "all" || career.industry === industryFilter;
    const matchesSalary =
      salaryFilter === "all" ||
      (career.salary_range && career.salary_range.includes(salaryFilter));

    return matchesSearch && matchesIndustry && matchesSalary;
  });

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="space-y-8">
          <Skeleton className="h-8 w-48" />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-64" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col space-y-12">
        {/* Featured Careers Section */}
        <section className="bg-gradient-to-br from-background/50 to-background/80 rounded-xl p-8 border shadow-sm">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h2 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/60">
                Featured Careers
              </h2>
              <p className="text-muted-foreground mt-2">
                Explore our handpicked selection of trending career paths
              </p>
            </div>
            <button 
              onClick={() => setIsDialogOpen(true)}
              className="text-primary hover:text-primary/80 transition-colors font-medium"
            >
              View all
            </button>
          </div>
          <Carousel
            opts={{
              align: "start",
              loop: true,
            }}
            plugins={[
              Autoplay({
                delay: 5000,
                stopOnInteraction: true,
                stopOnMouseEnter: true,
              }),
            ]}
            className="w-full"
          >
            <CarouselContent>
              {featuredCareers.map((career) => (
                <CarouselItem key={career.id} className="basis-full md:basis-1/2 lg:basis-1/3 pl-4">
                  <CareerCard {...career} />
                </CarouselItem>
              ))}
            </CarouselContent>
            <CarouselPrevious className="hidden md:flex -left-4" />
            <CarouselNext className="hidden md:flex -right-4" />
          </Carousel>
        </section>

        {/* Search and Filter Section */}
        <section className="space-y-8">
          <div>
            <h2 className="text-2xl font-bold mb-2">Explore All Careers</h2>
            <p className="text-muted-foreground">
              Find the perfect career path that matches your interests and skills
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-muted/50 p-6 rounded-lg">
            <Input
              placeholder="Search careers..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-background"
            />
            <Select value={industryFilter} onValueChange={setIndustryFilter}>
              <SelectTrigger className="bg-background">
                <SelectValue placeholder="Industry" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Industries</SelectItem>
                <SelectItem value="technology">Technology</SelectItem>
                <SelectItem value="healthcare">Healthcare</SelectItem>
                <SelectItem value="finance">Finance</SelectItem>
                <SelectItem value="education">Education</SelectItem>
              </SelectContent>
            </Select>
            <Select value={salaryFilter} onValueChange={setSalaryFilter}>
              <SelectTrigger className="bg-background">
                <SelectValue placeholder="Salary Range" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Ranges</SelectItem>
                <SelectItem value="0-50K">$0 - $50K</SelectItem>
                <SelectItem value="50K-100K">$50K - $100K</SelectItem>
                <SelectItem value="100K+">$100K+</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCareers.map((career) => (
              <CareerCard key={career.id} {...career} />
            ))}
          </div>
          
          {filteredCareers.length === 0 && (
            <div className="text-center py-12 bg-muted/50 rounded-lg">
              <h3 className="text-lg font-medium text-muted-foreground mb-2">
                No careers found
              </h3>
              <p className="text-sm text-muted-foreground">
                Try adjusting your filters or search terms
              </p>
            </div>
          )}
        </section>
      </div>

      <CareerListDialog
        isOpen={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        careers={careers}
      />
    </div>
  );
}