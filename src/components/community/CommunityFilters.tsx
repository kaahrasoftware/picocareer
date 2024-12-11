import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Badge } from "@/components/ui/badge";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { SearchBar } from "@/components/SearchBar";

interface CommunityFiltersProps {
  searchQuery: string;
  onSearchChange: (value: string) => void;
  selectedSkills: string[];
  onSkillsChange: (skills: string[]) => void;
  userTypeFilter: string | null;
  onUserTypeChange: (value: string | null) => void;
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
  selectedSkills = [],
  onSkillsChange,
  userTypeFilter,
  onUserTypeChange,
  locationFilter,
  onLocationChange,
  companyFilter,
  onCompanyChange,
  schoolFilter,
  onSchoolChange,
  fieldFilter,
  onFieldChange,
  locations = [],
  companies = [],
  schools = [],
  fields = [],
  allSkills = [],
}: CommunityFiltersProps) {
  return (
    <div className="space-y-4">
      <div className="flex-1">
        <SearchBar 
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Search by name, skills, company, position, school, or location..."
          className="max-w-xl"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <Select value={userTypeFilter || "all"} onValueChange={(value) => onUserTypeChange(value === "all" ? null : value)}>
          <SelectTrigger>
            <SelectValue placeholder="User Type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="student">Student</SelectItem>
            <SelectItem value="mentor">Mentor</SelectItem>
            <SelectItem value="professional">Professional</SelectItem>
          </SelectContent>
        </Select>

        <Select value={locationFilter || "all"} onValueChange={(value) => onLocationChange(value === "all" ? null : value)}>
          <SelectTrigger>
            <SelectValue placeholder="Location" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Locations</SelectItem>
            {locations.map((location) => (
              <SelectItem key={location} value={location}>{location}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={companyFilter || "all"} onValueChange={(value) => onCompanyChange(value === "all" ? null : value)}>
          <SelectTrigger>
            <SelectValue placeholder="Company" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Companies</SelectItem>
            {companies.map((company) => (
              <SelectItem key={company} value={company}>{company}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={schoolFilter || "all"} onValueChange={(value) => onSchoolChange(value === "all" ? null : value)}>
          <SelectTrigger>
            <SelectValue placeholder="School" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Schools</SelectItem>
            {schools.map((school) => (
              <SelectItem key={school} value={school}>{school}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={fieldFilter || "all"} onValueChange={(value) => onFieldChange(value === "all" ? null : value)}>
          <SelectTrigger>
            <SelectValue placeholder="Field of Interest" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Fields</SelectItem>
            {fields.map((field) => (
              <SelectItem key={field} value={field}>{field}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Command className="rounded-lg border shadow-md">
          <CommandList>
            <CommandGroup>
              <div className="flex flex-wrap gap-1 p-2">
                {selectedSkills.map((skill) => (
                  <Badge
                    key={skill}
                    variant="secondary"
                    className="mr-1 mb-1 cursor-pointer"
                    onClick={() => onSkillsChange(selectedSkills.filter(s => s !== skill))}
                  >
                    {skill} ×
                  </Badge>
                ))}
              </div>
              {allSkills.map((skill) => (
                <CommandItem
                  key={skill}
                  onSelect={() => {
                    if (selectedSkills.includes(skill)) {
                      onSkillsChange(selectedSkills.filter(s => s !== skill));
                    } else {
                      onSkillsChange([...selectedSkills, skill]);
                    }
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
        </Command>
      </div>
    </div>
  );
}