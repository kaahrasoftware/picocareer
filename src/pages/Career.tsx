import { useState } from "react";
import { CareerListDialog } from "@/components/CareerListDialog";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
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
  const [visibleCount, setVisibleCount] = useState(9);
  const LOAD_MORE_INCREMENT = 3;

  const { data: careers = [], isLoading } = useQuery({
    queryKey: ["careers"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("careers")
        .select("*")
        .eq('status', 'Approved')
        .eq('complete_career', true)
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

  return (
    <div className="container mx-auto px-4 py-8 animate-fade-in">
      <div className="flex flex-col space-y-12">
        <section className="space-y-8">
          <div className="sticky top-0 z-10 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 transition-all duration-200 pb-4">
            <div className="transform transition-transform duration-200 py-2">
              <h2 className="text-xl font-bold">Explore All Careers</h2>
              <p className="text-sm text-muted-foreground">
                Find the perfect career path that matches your interests and skills
              </p>
            </div>
            
            <div className="transform transition-all duration-200 -mx-2">
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
            </div>
          </div>

          <CareerResults 
            filteredCareers={visibleCareers} 
            isLoading={isLoading}
          />
          
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