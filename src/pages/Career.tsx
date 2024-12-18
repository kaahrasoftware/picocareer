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
import { Button } from "@/components/ui/button";
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
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data;
    },
  });

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
        <div className="space-y-4">
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
      <div className="flex flex-col space-y-8">
        {/* Featured Careers Section */}
        <section>
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold">Featured Careers</h2>
            <button 
              onClick={() => setIsDialogOpen(true)}
              className="text-primary hover:text-primary/80 transition-colors"
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
              {careers.map((career) => (
                <CarouselItem key={career.id} className="basis-1/3">
                  <CareerCard
                    id={career.id}
                    title={career.title}
                    description={career.description}
                    salary_range={career.salary_range}
                  />
                </CarouselItem>
              ))}
            </CarouselContent>
            <CarouselPrevious className="hidden md:flex" />
            <CarouselNext className="hidden md:flex" />
          </Carousel>
        </section>

        {/* Search and Filter Section */}
        <section>
          <h2 className="text-2xl font-bold mb-6">Explore Careers</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <Input
              placeholder="Search careers..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <Select value={industryFilter} onValueChange={setIndustryFilter}>
              <SelectTrigger>
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
              <SelectTrigger>
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
              <CareerCard
                key={career.id}
                id={career.id}
                title={career.title}
                description={career.description}
                salary_range={career.salary_range}
              />
            ))}
          </div>
          {filteredCareers.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              No careers found matching your filters.
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