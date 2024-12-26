import { useState, useEffect } from "react";
import { SelectFilter } from "./filters/SelectFilter";
import { SkillsFilter } from "./filters/SkillsFilter";
import { SearchInput } from "./filters/SearchInput";

interface CommunityFiltersProps {
  searchQuery: string;
  onSearchChange: (value: string) => void;
  selectedSkills: string[];
  onSkillsChange: (skills: string[]) => void;
  locationFilter: string | null;
  onLocationChange: (value: string | null) => void;
  companyFilter: string | null;
  onCompanyChange: (value: string | null) => void;
  schoolFilter: string | null;
  onSchoolChange: (value: string | null) => void;
  fieldFilter: string | null;
  onFieldChange: (value: string | null) => void;
  locations: string[];
  companies: string[];
  schools: string[];
  fields: string[];
  allSkills: string[];
}

export function CommunityFilters({
  searchQuery,
  onSearchChange,
  selectedSkills,
  onSkillsChange,
  locationFilter,
  onLocationChange,
  companyFilter,
  onCompanyChange,
  schoolFilter,
  onSchoolChange,
  fieldFilter,
  onFieldChange,
  locations,
  companies,
  schools,
  fields,
  allSkills,
}: CommunityFiltersProps) {
  const [skillSearchQuery, setSkillSearchQuery] = useState("");
  const [isSkillsOpen, setIsSkillsOpen] = useState(false);
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
      <div className={`space-y-4 transform transition-all duration-200 ${
        isScrolled ? 'p-2 space-y-2' : 'p-4'
      }`}>
        <div className="flex-1">
          <SearchInput 
            value={searchQuery} 
            onChange={onSearchChange}
            className={`transition-all duration-200 ${
              isScrolled ? 'h-8 text-sm' : 'h-10'
            }`}
          />
        </div>

        <div className={`grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4 ${
          isScrolled ? 'gap-2' : ''
        }`}>
          <SelectFilter
            value={locationFilter}
            onValueChange={onLocationChange}
            placeholder="Location"
            options={locations}
            className={`transition-all duration-200 ${
              isScrolled ? 'h-8 text-sm' : 'h-10'
            }`}
          />

          <SelectFilter
            value={companyFilter}
            onValueChange={onCompanyChange}
            placeholder="Company"
            options={companies}
            className={`transition-all duration-200 ${
              isScrolled ? 'h-8 text-sm' : 'h-10'
            }`}
          />

          <SelectFilter
            value={schoolFilter}
            onValueChange={onSchoolChange}
            placeholder="School"
            options={schools}
            className={`transition-all duration-200 ${
              isScrolled ? 'h-8 text-sm' : 'h-10'
            }`}
          />

          <SelectFilter
            value={fieldFilter}
            onValueChange={onFieldChange}
            placeholder="Field of Interest"
            options={fields}
            className={`transition-all duration-200 ${
              isScrolled ? 'h-8 text-sm' : 'h-10'
            }`}
          />

          <SkillsFilter
            selectedSkills={selectedSkills}
            onSkillsChange={onSkillsChange}
            allSkills={allSkills}
            skillSearchQuery={skillSearchQuery}
            onSkillSearchChange={setSkillSearchQuery}
            isOpen={isSkillsOpen}
            onOpenChange={setIsSkillsOpen}
            className={`transition-all duration-200 ${
              isScrolled ? 'h-8 text-sm' : 'h-10'
            }`}
          />
        </div>
      </div>
    </div>
  );
}