
import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Search, FilterIcon } from "lucide-react";
import { OpportunityType } from "@/types/database/enums";
import { OpportunityFilters } from "@/types/opportunity/types";
import { useResponsive } from "@/hooks/useResponsive";
import { useNavigate } from "react-router-dom";
import { useAuthSession } from "@/hooks/useAuthSession";

interface OpportunityHeaderProps {
  onSearch: (query: string) => void;
  onTypeChange: (type: OpportunityType | "all") => void;
  selectedType: OpportunityType | "all";
  showFilters?: () => void;
}

export function OpportunityHeader({
  onSearch,
  onTypeChange,
  selectedType,
  showFilters,
}: OpportunityHeaderProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const { isMobile } = useResponsive();
  const navigate = useNavigate();
  const { session } = useAuthSession();

  const handleSearch = () => {
    onSearch(searchQuery);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between gap-4">
        <h1 className="text-3xl font-bold">Opportunities</h1>
        
        <div className="flex gap-2">
          {session && (
            <Button
              variant="outline"
              onClick={() => navigate("/applications")}
              className="whitespace-nowrap"
            >
              My Applications
            </Button>
          )}
          
          {isMobile && showFilters && (
            <Button
              variant="outline"
              onClick={showFilters}
              className="flex items-center gap-1"
            >
              <FilterIcon className="h-4 w-4" />
              Filters
            </Button>
          )}
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-grow">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Search opportunities..."
            className="pl-10"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={handleKeyDown}
          />
        </div>
        <Button onClick={handleSearch}>Search</Button>
      </div>

      <Tabs
        defaultValue="all"
        value={selectedType}
        onValueChange={(value) => onTypeChange(value as OpportunityType | "all")}
      >
        <TabsList className="w-full md:w-fit flex overflow-x-auto">
          <TabsTrigger value="all">All Types</TabsTrigger>
          <TabsTrigger value="job">Jobs</TabsTrigger>
          <TabsTrigger value="internship">Internships</TabsTrigger>
          <TabsTrigger value="scholarship">Scholarships</TabsTrigger>
          <TabsTrigger value="fellowship">Fellowships</TabsTrigger>
          <TabsTrigger value="grant">Grants</TabsTrigger>
          <TabsTrigger value="competition">Competitions</TabsTrigger>
          <TabsTrigger value="event">Events</TabsTrigger>
          <TabsTrigger value="volunteer">Volunteer</TabsTrigger>
        </TabsList>
      </Tabs>
    </div>
  );
}
