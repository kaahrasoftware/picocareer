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
  isMobile?: boolean;
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
  isMobile = false,
}: CareerFiltersProps) => {
  if (isMobile) {
    return (
      <div className="space-y-2 bg-muted/50 p-2 rounded-lg">
        {/* Priority: Search first on mobile */}
        <Input
          placeholder="Search careers..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="bg-background h-10 text-base"
        />
        
        {/* Simplified filters row */}
        <div className="grid grid-cols-2 gap-2">
          <Select value={industryFilter} onValueChange={setIndustryFilter}>
            <SelectTrigger className="bg-background h-9 text-sm">
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
            <SelectTrigger className="bg-background h-9 text-sm">
              <SelectValue placeholder="Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="popular">Popular</SelectItem>
              <SelectItem value="rare">Rare</SelectItem>
              <SelectItem value="new">New</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Show selected skills as chips */}
        {selectedSkills.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {selectedSkills.map((skill) => (
              <Badge
                key={skill}
                variant="secondary"
                className="text-xs cursor-pointer"
                onClick={() => setSelectedSkills(selectedSkills.filter(s => s !== skill))}
              >
                {skill} ×
              </Badge>
            ))}
          </div>
        )}

        {/* Simplified skills filter */}
        <div className="relative">
          <Command className="rounded-lg border">
            <CommandInput 
              placeholder="Add skills filter..." 
              value={skillSearchQuery}
              onValueChange={setSkillSearchQuery}
              onFocus={() => setIsSkillsDropdownOpen(true)}
              className="h-9 text-sm"
            />
            {isSkillsDropdownOpen && (
              <CommandList className="absolute w-full bg-popover z-50 max-h-40">
                <CommandGroup>
                  {allSkills
                    .filter(skill => skill.toLowerCase().includes(skillSearchQuery.toLowerCase()))
                    .slice(0, 8) // Limit results on mobile
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
                          setIsSkillsDropdownOpen(false);
                        }}
                        className="cursor-pointer text-sm"
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
  }

  // Desktop layout (original)
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-2 bg-muted/50 p-3 rounded-lg">
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
  );
};