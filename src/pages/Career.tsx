import { useState } from "react";
import { CareerCard } from "@/components/CareerCard";
import { CareerListDialog } from "@/components/CareerListDialog";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

export default function Career() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [industryFilter, setIndustryFilter] = useState("all");
  const [salaryFilter, setSalaryFilter] = useState("all");
  const [educationFilter, setEducationFilter] = useState<string>("all");
  const [stressLevelFilter, setStressLevelFilter] = useState("all");
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
  const [isSkillsDropdownOpen, setIsSkillsDropdownOpen] = useState(false);
  const [skillSearchQuery, setSkillSearchQuery] = useState("");
  const [popularFilter, setPopularFilter] = useState<string>("all");

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
  const stressLevels = Array.from(new Set(careers.map(career => career.stress_levels).filter(Boolean)));

  const filteredCareers = careers.filter((career) => {
    const matchesSearch = career.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      career.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesIndustry = industryFilter === "all" || career.industry === industryFilter;
    const matchesSalary = salaryFilter === "all" || 
      (career.salary_range && career.salary_range.includes(salaryFilter));
    const matchesEducation = educationFilter === "all" || 
      (career.required_education && career.required_education.includes(educationFilter));
    const matchesStressLevel = stressLevelFilter === "all" || 
      career.stress_levels === stressLevelFilter;
    const matchesSkills = selectedSkills.length === 0 || 
      (career.required_skills && selectedSkills.every(skill => 
        career.required_skills.includes(skill)
      ));
    const matchesPopular = popularFilter === "all" || 
      (popularFilter === "popular" ? career.popular : 
       popularFilter === "rare" ? career.rare :
       popularFilter === "new" ? career.new_career : true);

    return matchesSearch && matchesIndustry && matchesSalary && 
           matchesEducation && matchesStressLevel && matchesSkills && 
           matchesPopular;
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
        <section className="space-y-8">
          <div>
            <h2 className="text-2xl font-bold mb-2">Explore All Careers</h2>
            <p className="text-muted-foreground">
              Find the perfect career path that matches your interests and skills
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 bg-muted/50 p-6 rounded-lg">
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
                {industries.map((industry) => (
                  <SelectItem key={industry} value={industry}>{industry}</SelectItem>
                ))}
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

            <Select value={educationFilter} onValueChange={setEducationFilter}>
              <SelectTrigger className="bg-background">
                <SelectValue placeholder="Education Level" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Levels</SelectItem>
                <SelectItem value="High School">High School</SelectItem>
                <SelectItem value="Bachelor's Degree">Bachelor's Degree</SelectItem>
                <SelectItem value="Master's Degree">Master's Degree</SelectItem>
                <SelectItem value="PhD">PhD</SelectItem>
              </SelectContent>
            </Select>

            <Select value={stressLevelFilter} onValueChange={setStressLevelFilter}>
              <SelectTrigger className="bg-background">
                <SelectValue placeholder="Stress Level" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Levels</SelectItem>
                {stressLevels.map((level) => (
                  <SelectItem key={level} value={level}>{level}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={popularFilter} onValueChange={setPopularFilter}>
              <SelectTrigger className="bg-background">
                <SelectValue placeholder="Career Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="popular">Popular Careers</SelectItem>
                <SelectItem value="rare">Rare Opportunities</SelectItem>
                <SelectItem value="new">New Careers</SelectItem>
              </SelectContent>
            </Select>

            <div className="relative">
              <Command className="rounded-lg border shadow-md">
                <CommandInput 
                  placeholder="Filter by skills..." 
                  value={skillSearchQuery}
                  onValueChange={setSkillSearchQuery}
                  onFocus={() => setIsSkillsDropdownOpen(true)}
                />
                {isSkillsDropdownOpen && (
                  <CommandList>
                    <CommandGroup>
                      <div className="flex flex-wrap gap-1 p-2">
                        {selectedSkills.map((skill) => (
                          <Badge
                            key={skill}
                            variant="secondary"
                            className="mr-1 mb-1 cursor-pointer"
                            onClick={() => setSelectedSkills(selectedSkills.filter(s => s !== skill))}
                          >
                            {skill} ×
                          </Badge>
                        ))}
                      </div>
                      {allSkills
                        .filter(skill => skill.toLowerCase().includes(skillSearchQuery.toLowerCase()))
                        .map((skill) => (
                          <CommandItem
                            key={skill}
                            onSelect={() => {
                              if (selectedSkills.includes(skill)) {
                                setSelectedSkills(selectedSkills.filter(s => s !== skill));
                              } else {
                                setSelectedSkills([...selectedSkills, skill]);
                              }
                              setSkillSearchQuery("");
                            }}
                            className="cursor-pointer"
                          >
                            <Check
                              className={cn(
                                "mr-2 h-4 w-4",
                                selectedSkills.includes(skill) ? "opacity-100" : "opacity-0"
                              )}
                            />
                            {skill}
                          </CommandItem>
                        ))}
                    </CommandGroup>
                  </CommandList>
                )}
              </Command>
            </div>
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