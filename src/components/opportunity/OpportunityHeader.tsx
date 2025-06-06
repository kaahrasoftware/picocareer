
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, X } from "lucide-react";
import { useState, useEffect } from "react";
import { OpportunityType } from "@/types/database/enums";
import { useResponsive } from "@/hooks/useResponsive";
import { getOpportunityTypeStyles } from "@/utils/opportunityUtils";
import { cn } from "@/lib/utils";

interface OpportunityHeaderProps {
  onSearch: (search: string) => void;
  onTypeChange: (type: OpportunityType | "all") => void;
  selectedType: OpportunityType | "all" | undefined;
}

export function OpportunityHeader({
  onSearch,
  onTypeChange,
  selectedType = "all",
}: OpportunityHeaderProps) {
  const [searchValue, setSearchValue] = useState("");
  const { isMobile } = useResponsive();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(searchValue);
  };

  const clearSearch = () => {
    setSearchValue("");
    onSearch("");
  };

  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      onSearch(searchValue);
    }, 300);

    return () => clearTimeout(debounceTimer);
  }, [searchValue, onSearch]);

  const opportunityTypes: { type: OpportunityType | "all"; label: string }[] = [
    { type: "all", label: "All Types" },
    { type: OpportunityType.JOB, label: "Jobs" },
    { type: OpportunityType.INTERNSHIP, label: "Internships" },
    { type: OpportunityType.SCHOLARSHIP, label: "Scholarships" },
    { type: OpportunityType.FELLOWSHIP, label: "Fellowships" },
    { type: OpportunityType.GRANT, label: "Grants" },
    { type: OpportunityType.COMPETITION, label: "Competitions" },
    { type: OpportunityType.VOLUNTEER, label: "Volunteer" },
    { type: OpportunityType.EVENT, label: "Events" },
    { type: OpportunityType.OTHER, label: "Other" },
  ];

  return (
    <div className="space-y-6">
      <div className="text-center max-w-3xl mx-auto">
        <h1 className="text-3xl md:text-4xl font-bold mb-3">Opportunities</h1>
        <p className="text-muted-foreground">
          Discover jobs, internships, scholarships, and more opportunities to advance your career
        </p>
      </div>

      <form onSubmit={handleSearch} className="relative max-w-2xl mx-auto">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
        <Input
          value={searchValue}
          onChange={(e) => setSearchValue(e.target.value)}
          placeholder="Search for opportunities..."
          className="pl-10 pr-10"
        />
        {searchValue && (
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="absolute right-1 top-1/2 transform -translate-y-1/2 h-8 w-8"
            onClick={clearSearch}
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </form>

      <div className="flex justify-center flex-wrap gap-2">
        {opportunityTypes.map((item) => {
          const typeStyles = getOpportunityTypeStyles(item.type);
          const isSelected = selectedType === item.type;
          
          return (
            <Button
              key={item.type}
              variant={isSelected ? "default" : "outline"}
              size={isMobile ? "sm" : "default"}
              className={cn(
                "rounded-full transition-all",
                !isSelected && typeStyles.bg,
                !isSelected && typeStyles.text,
                !isSelected && "hover:bg-opacity-80"
              )}
              onClick={() => onTypeChange(item.type)}
            >
              {item.label}
            </Button>
          );
        })}
      </div>
    </div>
  );
}
