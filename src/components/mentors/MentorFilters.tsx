import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface MentorFiltersProps {
  searchQuery: string;
  setSearchQuery: (value: string) => void;
  companyFilter: string;
  setCompanyFilter: (value: string) => void;
  educationFilter: string;
  setEducationFilter: (value: string) => void;
  experienceFilter: string;
  setExperienceFilter: (value: string) => void;
  sessionFilter: string;
  setSessionFilter: (value: string) => void;
}

export function MentorFilters({
  searchQuery,
  setSearchQuery,
  companyFilter,
  setCompanyFilter,
  educationFilter,
  setEducationFilter,
  experienceFilter,
  setExperienceFilter,
  sessionFilter,
  setSessionFilter,
}: MentorFiltersProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      <Input
        placeholder="Search mentors..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        className="w-full"
      />
      
      <Select value={companyFilter} onValueChange={setCompanyFilter}>
        <SelectTrigger>
          <SelectValue placeholder="Company" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Companies</SelectItem>
          <SelectItem value="Microsoft Inc.">Microsoft</SelectItem>
          <SelectItem value="Lenovo">Lenovo</SelectItem>
          <SelectItem value="Georgia Tech">Georgia Tech</SelectItem>
          <SelectItem value="Walmart">Walmart</SelectItem>
        </SelectContent>
      </Select>

      <Select value={educationFilter} onValueChange={setEducationFilter}>
        <SelectTrigger>
          <SelectValue placeholder="Education" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Education Levels</SelectItem>
          <SelectItem value="Bachelor's">Bachelor's Degree</SelectItem>
          <SelectItem value="Master's">Master's Degree</SelectItem>
          <SelectItem value="PhD">PhD</SelectItem>
        </SelectContent>
      </Select>

      <Select value={experienceFilter} onValueChange={setExperienceFilter}>
        <SelectTrigger>
          <SelectValue placeholder="Experience Level" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Levels</SelectItem>
          <SelectItem value="Junior">Junior</SelectItem>
          <SelectItem value="Senior">Senior</SelectItem>
          <SelectItem value="Lead">Lead</SelectItem>
          <SelectItem value="Principal">Principal</SelectItem>
        </SelectContent>
      </Select>

      <Select value={sessionFilter} onValueChange={setSessionFilter}>
        <SelectTrigger>
          <SelectValue placeholder="Sessions Held" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All</SelectItem>
          <SelectItem value="10+">10+ Sessions</SelectItem>
          <SelectItem value="50+">50+ Sessions</SelectItem>
          <SelectItem value="100+">100+ Sessions</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}