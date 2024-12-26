import { useState } from "react";
import { CareerListDialog } from "@/components/CareerListDialog";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Skeleton } from "@/components/ui/skeleton";
import { CareerFilters } from "@/components/career/CareerFilters";
import { CareerResults } from "@/components/career/CareerResults";
import { Button } from "@/components/ui/button";

export default function Career() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [industryFilter, setIndustryFilter] = useState("all");
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
  const [isSkillsDropdownOpen, setIsSkillsDropdownOpen] = useState(false);
  const [skillSearchQuery, setSkillSearchQuery] = useState("");
  const [popularFilter, setPopularFilter] = useState<string>("all");
  const [visibleCount, setVisibleCount] = useState(9); // Changed from 15 to 9
  const LOAD_MORE_INCREMENT = 3;

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

  // Extract unique values for filters
  const industries = Array.from(new Set(careers.map(career => career.industry).filter(Boolean)));
  const allSkills = Array.from(new Set(careers.flatMap(career => career.required_skills || []))).sort();

  const filteredCareers = careers.filter((career) => {
    const searchableFields = [
      career.title,
      career.description,
      ...(career.required_skills || []),
      ...(career.required_tools || []),
      career.job_outlook,
      career.industry,
      career.work_environment,
      career.growth_potential,
      ...(career.keywords || []),
      ...(career.transferable_skills || []),
      ...(career.careers_to_consider_switching_to || []),
      ...(career.required_education || []),
      ...(career.academic_majors || []),
      career.important_note
    ].filter(Boolean).join(" ").toLowerCase();

    const matchesSearch = searchQuery === "" || searchableFields.includes(searchQuery.toLowerCase());
    const matchesIndustry = industryFilter === "all" || career.industry === industryFilter;
    const matchesSkills = selectedSkills.length === 0 || 
      (career.required_skills && selectedSkills.some(skill => 
        career.required_skills.includes(skill)
      ));
    const matchesPopular = popularFilter === "all" || 
      (popularFilter === "popular" ? career.popular : 
       popularFilter === "rare" ? career.rare :
       popularFilter === "new" ? career.new_career : true);

    return matchesSearch && matchesIndustry && matchesSkills && matchesPopular;
  });

  const visibleCareers = filteredCareers.slice(0, visibleCount);
  const hasMore = visibleCount < filteredCareers.length;

  const handleLoadMore = () => {
    setVisibleCount(prev => prev + LOAD_MORE_INCREMENT);
  };

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
        <section className="space-y-8">
          <div>
            <h2 className="text-2xl font-bold mb-2">Explore All Careers</h2>
            <p className="text-muted-foreground">
              Find the perfect career path that matches your interests and skills
            </p>
          </div>
          
          <CareerFilters
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            industryFilter={industryFilter}
            setIndustryFilter={setIndustryFilter}
            selectedSkills={selectedSkills}
            setSelectedSkills={setSelectedSkills}
            isSkillsDropdownOpen={isSkillsDropdownOpen}
            setIsSkillsDropdownOpen={setIsSkillsDropdownOpen}
            skillSearchQuery={skillSearchQuery}
            setSkillSearchQuery={setSkillSearchQuery}
            popularFilter={popularFilter}
            setPopularFilter={setPopularFilter}
            industries={industries}
            allSkills={allSkills}
          />

          <CareerResults filteredCareers={visibleCareers} />
          
          {hasMore && (
            <div className="flex justify-center mt-8">
              <Button 
                variant="outline" 
                onClick={handleLoadMore}
                className="min-w-[200px]"
              >
                Load More Careers
              </Button>
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
