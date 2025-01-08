import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Check, Filter, ChevronUp, ChevronDown } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { Button } from "@/components/ui/button";

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
  allSkills = [],
}: CareerFiltersProps) => {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="relative w-full">
      {/* Mobile Toggle Button */}
      <Button
        variant="outline"
        className="w-full md:hidden mb-2 flex items-center justify-between"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4" />
          <span>Filters</span>
        </div>
        {isExpanded ? (
          <ChevronUp className="h-4 w-4" />
        ) : (
          <ChevronDown className="h-4 w-4" />
        )}
      </Button>

      {/* Filters Content */}
      <div
        className={cn(
          "grid gap-2 bg-muted/50 p-3 rounded-lg transition-all duration-200",
          {
            "grid-cols-1 md:grid-cols-2 lg:grid-cols-4": true,
            "hidden md:grid": !isExpanded,
            "grid": isExpanded,
          }
        )}
      >
        <Input
          placeholder="Search careers..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="bg-background h-9"
        />
        
        <Select value={industryFilter} onValueChange={setIndustryFilter}>
          <SelectTrigger className="bg-background h-9">
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
          <SelectTrigger className="bg-background h-9">
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
              className="h-9"
            />
            {isSkillsDropdownOpen && (
              <CommandList className="absolute w-full bg-popover z-50">
                <CommandGroup>
                  <div className="flex flex-wrap gap-1 p-2">
                    {selectedSkills.map((skill) => (
                      <Badge
                        key={skill}
                        variant="secondary"
                        className="mr-1 mb-1 cursor-pointer text-xs"
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
    </div>
  );
};