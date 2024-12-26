import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Check } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface CareerFiltersProps {
  searchQuery: string;
  setSearchQuery: (value: string) => void;
  industryFilter: string;
  setIndustryFilter: (value: string) => void;
  selectedSkills: string[];
  setSelectedSkills: (skills: string[]) => void;
  isSkillsDropdownOpen: boolean;
  setIsSkillsDropdownOpen: (isOpen: boolean) => void;
  skillSearchQuery: string;
  setSkillSearchQuery: (query: string) => void;
  popularFilter: string;
  setPopularFilter: (value: string) => void;
  industries: string[];
  allSkills: string[];
}

export const CareerFilters = ({
  searchQuery,
  setSearchQuery,
  industryFilter,
  setIndustryFilter,
  selectedSkills,
  setSelectedSkills,
  isSkillsDropdownOpen,
  setIsSkillsDropdownOpen,
  skillSearchQuery,
  setSkillSearchQuery,
  popularFilter,
  setPopularFilter,
  industries,
  allSkills,
}: CareerFiltersProps) => {
  return (
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

      <div 
        className="relative"
        onMouseLeave={() => setIsSkillsDropdownOpen(false)}
      >
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
  );
};