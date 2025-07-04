
import { useState } from "react";
import { Search, Filter, X, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";

interface MentorHorizontalFiltersProps {
  searchQuery: string;
  companyFilter: string;
  locationFilter: string;
  skillsFilter: string;
  onFiltersChange: (filters: Record<string, string>) => void;
  mentors: any[];
}

export function MentorHorizontalFilters({
  searchQuery,
  companyFilter,
  locationFilter,
  skillsFilter,
  onFiltersChange,
  mentors
}: MentorHorizontalFiltersProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  // Extract unique values for filter options
  const companies = [...new Set(mentors.map(m => m.company_name).filter(Boolean))].sort();
  const locations = [...new Set(mentors.map(m => m.location).filter(Boolean))].sort();
  const skills = [...new Set(mentors.flatMap(m => m.skills || []))].sort();

  const handleSearchChange = (value: string) => {
    onFiltersChange({ search: value });
  };

  const handleFilterChange = (key: string, value: string) => {
    onFiltersChange({ [key]: value });
  };

  const clearFilters = () => {
    onFiltersChange({
      search: "",
      company: "all",
      location: "all",
      skills: "all"
    });
  };

  const hasActiveFilters = searchQuery || companyFilter !== "all" || locationFilter !== "all" || skillsFilter !== "all";

  return (
    <div className="py-4">
      {/* Basic Filters Row */}
      <div className="flex items-center gap-4 mb-4">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            placeholder="Search mentors by name, title, or company..."
            value={searchQuery}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="pl-10 border-gray-200 focus:border-[#00A6D4] focus:ring-[#00A6D4]"
          />
        </div>

        {/* Quick Filters */}
        <Select value={companyFilter} onValueChange={(value) => handleFilterChange("company", value)}>
          <SelectTrigger className="w-48 border-gray-200">
            <SelectValue placeholder="All Companies" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Companies</SelectItem>
            {companies.slice(0, 10).map((company) => (
              <SelectItem key={company} value={company}>
                {company}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={locationFilter} onValueChange={(value) => handleFilterChange("location", value)}>
          <SelectTrigger className="w-48 border-gray-200">
            <SelectValue placeholder="All Locations" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Locations</SelectItem>
            {locations.slice(0, 10).map((location) => (
              <SelectItem key={location} value={location}>
                {location}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* More Filters Toggle */}
        <Collapsible open={isExpanded} onOpenChange={setIsExpanded}>
          <CollapsibleTrigger asChild>
            <Button variant="outline" className="border-gray-200">
              <Filter className="w-4 h-4 mr-2" />
              More Filters
              <ChevronDown className={`w-4 h-4 ml-2 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
            </Button>
          </CollapsibleTrigger>
        </Collapsible>

        {/* Clear Filters */}
        {hasActiveFilters && (
          <Button
            variant="ghost"
            onClick={clearFilters}
            className="text-gray-500 hover:text-gray-700"
          >
            <X className="w-4 h-4 mr-2" />
            Clear All
          </Button>
        )}
      </div>

      {/* Expanded Filters */}
      <Collapsible open={isExpanded} onOpenChange={setIsExpanded}>
        <CollapsibleContent className="space-y-4 pt-4 border-t border-gray-100">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Skills</label>
              <Select value={skillsFilter} onValueChange={(value) => handleFilterChange("skills", value)}>
                <SelectTrigger className="border-gray-200">
                  <SelectValue placeholder="All Skills" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Skills</SelectItem>
                  {skills.slice(0, 20).map((skill) => (
                    <SelectItem key={skill} value={skill}>
                      {skill}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">More Companies</label>
              <Select value={companyFilter} onValueChange={(value) => handleFilterChange("company", value)}>
                <SelectTrigger className="border-gray-200">
                  <SelectValue placeholder="All Companies" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Companies</SelectItem>
                  {companies.map((company) => (
                    <SelectItem key={company} value={company}>
                      {company}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">More Locations</label>
              <Select value={locationFilter} onValueChange={(value) => handleFilterChange("location", value)}>
                <SelectTrigger className="border-gray-200">
                  <SelectValue placeholder="All Locations" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Locations</SelectItem>
                  {locations.map((location) => (
                    <SelectItem key={location} value={location}>
                      {location}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
}
