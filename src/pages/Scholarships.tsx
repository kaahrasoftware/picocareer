
import { SidebarProvider } from "@/components/ui/sidebar";
import { MenuSidebar } from "@/components/MenuSidebar";
import { ScholarshipHeader } from "@/components/scholarships/ScholarshipHeader";
import { ScholarshipFilters } from "@/components/scholarships/ScholarshipFilters";
import { ScholarshipGrid } from "@/components/scholarships/ScholarshipGrid";
import { FeaturedScholarships } from "@/components/scholarships/FeaturedScholarships";
import { useScholarshipFilters } from "@/hooks/useScholarshipFilters";

export default function Scholarships() {
  const { 
    categories,
    scholarships,
    isLoading,
    handleFilterChange,
    resetFilters 
  } = useScholarshipFilters();

  const featuredScholarships = scholarships.filter((s) => s.featured);

  return (
    <SidebarProvider>
      <div className="app-layout">
        <MenuSidebar />
        <div className="main-content">
          <div className="px-4 md:px-8 py-8 max-w-7xl mx-auto w-full">
            <div className="space-y-8">
              <ScholarshipHeader />
              
              <FeaturedScholarships scholarships={featuredScholarships} />

              <ScholarshipFilters
                onFilterChange={handleFilterChange}
                categories={categories}
              />

              <ScholarshipGrid
                scholarships={scholarships}
                isLoading={isLoading}
                resetFilters={resetFilters}
              />
            </div>
          </div>
        </div>
      </div>
    </SidebarProvider>
  );
}
