import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface CareerFiltersProps {
  searchQuery: string;
  setSearchQuery: (value: string) => void;
  categoryFilter: string;
  setCategoryFilter: (value: string) => void;
  salaryFilter: string;
  setSalaryFilter: (value: string) => void;
  studyLevelFilter: string;
  setStudyLevelFilter: (value: string) => void;
  skillsFilter: string;
  setSkillsFilter: (value: string) => void;
}

export function CareerFilters({
  searchQuery,
  setSearchQuery,
  categoryFilter,
  setCategoryFilter,
  salaryFilter,
  setSalaryFilter,
  studyLevelFilter,
  setStudyLevelFilter,
  skillsFilter,
  setSkillsFilter,
}: CareerFiltersProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      <Input
        placeholder="Search careers..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        className="w-full"
      />
      
      <Select value={categoryFilter} onValueChange={setCategoryFilter}>
        <SelectTrigger>
          <SelectValue placeholder="Category" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Categories</SelectItem>
          <SelectItem value="technology">Technology</SelectItem>
          <SelectItem value="healthcare">Healthcare</SelectItem>
          <SelectItem value="finance">Finance</SelectItem>
          <SelectItem value="education">Education</SelectItem>
        </SelectContent>
      </Select>

      <Select value={salaryFilter} onValueChange={setSalaryFilter}>
        <SelectTrigger>
          <SelectValue placeholder="Salary Range" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Ranges</SelectItem>
          <SelectItem value="0-50K">$0 - $50K</SelectItem>
          <SelectItem value="50K-100K">$50K - $100K</SelectItem>
          <SelectItem value="100K+">$100K+</SelectItem>
        </SelectContent>
      </Select>

      <Select value={studyLevelFilter} onValueChange={setStudyLevelFilter}>
        <SelectTrigger>
          <SelectValue placeholder="Level of Study" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Levels</SelectItem>
          <SelectItem value="high-school">High School</SelectItem>
          <SelectItem value="bachelors">Bachelor's Degree</SelectItem>
          <SelectItem value="masters">Master's Degree</SelectItem>
          <SelectItem value="phd">PhD</SelectItem>
        </SelectContent>
      </Select>

      <Input
        placeholder="Filter by skills..."
        value={skillsFilter}
        onChange={(e) => setSkillsFilter(e.target.value)}
        className="w-full"
      />
    </div>
  );
}