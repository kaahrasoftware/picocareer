
import { useState } from "react";
import { SchoolsGrid } from "@/components/schools/SchoolsGrid";
import { SchoolFilters, SchoolFilters as SchoolFiltersType } from "@/components/schools/SchoolFilters";

export function SchoolsPage() {
  const [filters, setFilters] = useState<SchoolFiltersType>({
    type: "all",
    country: "all"
  });
  const [searchTerm, setSearchTerm] = useState<string>("");

  const handleFilterChange = (newFilters: SchoolFiltersType) => {
    setFilters(newFilters);
  };

  const handleSearch = (term: string) => {
    setSearchTerm(term);
  };

  return (
    <div className="container py-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">Find Your School</h1>
        <p className="text-muted-foreground">
          Browse schools and universities to find information about programs and admission
        </p>
      </div>

      <SchoolFilters 
        onFilterChange={handleFilterChange} 
        onSearch={handleSearch} 
      />
      
      <SchoolsGrid 
        filter={filters} 
        searchTerm={searchTerm} 
      />
    </div>
  );
}
