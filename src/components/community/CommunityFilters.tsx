import { useState, useEffect } from "react";
import { SelectFilter } from "./filters/SelectFilter";
import { SearchInput } from "./filters/SearchInput";
import { Card } from "@/components/ui/card";
import { Filter } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

export interface CommunityFiltersProps {
  searchQuery: string;
  onSearchChange: (value: string) => void;
  fieldFilter: string | null;
  onFieldChange: (value: string | null) => void;
  fields: string[];
  selectedSkills?: string[];
  onSkillsChange?: (skills: string[]) => void;
  isSkillsDropdownOpen?: boolean;
  setIsSkillsDropdownOpen?: (isOpen: boolean) => void;
  skillSearchQuery?: string;
  setSkillSearchQuery?: (query: string) => void;
  popularFilter?: string;
  setPopularFilter?: (filter: string) => void;
  allSkills?: string[];
  locationFilter?: string | null;
  onLocationChange?: (value: string | null) => void;
  companyFilter?: string | null;
  onCompanyChange?: (value: string | null) => void;
  schoolFilter?: string | null;
  onSchoolChange?: (value: string | null) => void;
  locations?: string[];
  companies?: string[];
  schools?: string[];
  hasAvailabilityFilter?: boolean;
  onHasAvailabilityChange?: (value: boolean) => void;
}

export function CommunityFilters({
  searchQuery,
  onSearchChange,
  fieldFilter,
  onFieldChange,
  fields,
  selectedSkills,
  onSkillsChange,
  isSkillsDropdownOpen,
  setIsSkillsDropdownOpen,
  skillSearchQuery,
  setSkillSearchQuery,
  popularFilter,
  setPopularFilter,
  allSkills,
  locationFilter,
  onLocationChange,
  companyFilter,
  onCompanyChange,
  schoolFilter,
  onSchoolChange,
  locations,
  companies,
  schools,
  hasAvailabilityFilter = false,
  onHasAvailabilityChange,
}: CommunityFiltersProps) {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = (e: Event) => {
      const target = e.target as HTMLDivElement;
      setIsScrolled(target.scrollTop > 20);
    };

    const dialogContent = document.querySelector('.max-h-\\[80vh\\]');
    dialogContent?.addEventListener('scroll', handleScroll);

    return () => {
      dialogContent?.removeEventListener('scroll', handleScroll);
    };
  }, []);

  return (
    <div className="sticky top-0 z-10 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <Card className={`border-0 shadow-none ${
        isScrolled ? 'p-2' : 'p-4'
      }`}>
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Filter className="h-4 w-4" />
            <h2 className="text-sm font-medium">Filters</h2>
          </div>

          <div className="flex gap-4">
            <div className="flex-1 max-w-[60%]">
              <SearchInput 
                value={searchQuery} 
                onChange={onSearchChange}
                className={`transition-all duration-200 ${
                  isScrolled ? 'h-8 text-sm' : 'h-10'
                }`}
                placeholder="Search by title, description, skills..."
              />
            </div>

            <div className="flex-1 max-w-[40%]">
              <SelectFilter
                value={fieldFilter}
                onValueChange={onFieldChange}
                placeholder="Category"
                options={fields}
                className={`transition-all duration-200 ${
                  isScrolled ? 'h-8 text-sm' : 'h-10'
                }`}
              />
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              id="has-availability"
              checked={hasAvailabilityFilter}
              onCheckedChange={onHasAvailabilityChange}
            />
            <Label htmlFor="has-availability">Show only mentors with available time slots</Label>
          </div>
        </div>
      </Card>
    </div>
  );
}