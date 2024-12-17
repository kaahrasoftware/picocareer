import { useState } from "react";
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

  return (
    <div className="space-y-4">
      <div className="flex-1">
        <SearchInput value={searchQuery} onChange={onSearchChange} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
        <SelectFilter
          value={locationFilter}
          onValueChange={onLocationChange}
          placeholder="Location"
          options={locations}
        />

        <SelectFilter
          value={companyFilter}
          onValueChange={onCompanyChange}
          placeholder="Company"
          options={companies}
        />

        <SelectFilter
          value={schoolFilter}
          onValueChange={onSchoolChange}
          placeholder="School"
          options={schools}
        />

        <SelectFilter
          value={fieldFilter}
          onValueChange={onFieldChange}
          placeholder="Field of Interest"
          options={fields}
        />

        <SkillsFilter
          selectedSkills={selectedSkills}
          onSkillsChange={onSkillsChange}
          allSkills={allSkills}
          skillSearchQuery={skillSearchQuery}
          onSkillSearchChange={setSkillSearchQuery}
          isOpen={isSkillsOpen}
          onOpenChange={setIsSkillsOpen}
        />
      </div>
    </div>
  );
}