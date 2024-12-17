import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { CareerCard } from "@/components/CareerCard";
import { useState } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { CommunityFilters } from "@/components/community/CommunityFilters";
import { BlogPagination } from "@/components/blog/BlogPagination";
import { MenuSidebar } from "@/components/MenuSidebar";
import { SidebarProvider } from "@/components/ui/sidebar";
import { useToast } from "@/hooks/use-toast";
import type { Career } from "@/types/database/careers";

export default function CareerPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
  const [industryFilter, setIndustryFilter] = useState<string | null>(null);
  const [salaryFilter, setSalaryFilter] = useState<string | null>(null);
  const [educationFilter, setEducationFilter] = useState<string | null>(null);
  const [fieldFilter, setFieldFilter] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const CAREERS_PER_PAGE = 15;
  const { toast } = useToast();

  const { data: careers = [], isLoading, error } = useQuery({
    queryKey: ['careers'],
    queryFn: async () => {
      console.log('Fetching careers...');
      
      try {
        const { data, error } = await supabase
          .from('careers')
          .select('*')
          .order('created_at', { ascending: false });
        
        if (error) {
          console.error('Supabase query error:', error);
          throw error;
        }

        console.log('Careers fetched successfully:', data?.length);
        return data;
      } catch (err) {
        console.error('Error in careers query:', err);
        toast({
          title: "Error loading careers",
          description: "There was an error loading the careers. Please try again later.",
          variant: "destructive",
        });
        throw err;
      }
    },
    retry: 2,
    retryDelay: 1000,
  });

  if (error) {
    console.error('React Query error:', error);
  }

  const industries = Array.from(new Set(careers?.map(c => c.industry).filter(Boolean) || [])).sort();
  const salaryRanges = Array.from(new Set(careers?.map(c => c.salary_range).filter(Boolean) || [])).sort();
  const educationLevels = Array.from(new Set(careers?.flatMap(c => c.required_education || []) || [])).sort();
  const allSkills = Array.from(new Set(careers?.flatMap(c => c.required_skills || []) || [])).sort();
  const fields = Array.from(new Set(careers?.map(c => c.industry).filter(Boolean) || [])).sort();

  const filteredCareers = careers?.filter(career => {
    const searchableFields = [
      career.title,
      career.description,
      career.industry,
      ...(career.required_skills || []),
      ...(career.required_tools || []),
      ...(career.keywords || [])
    ].filter(Boolean).map(field => field.toLowerCase());

    const matchesSearch = searchQuery === "" || 
      searchableFields.some(field => field.includes(searchQuery.toLowerCase()));

    const matchesSkills = selectedSkills.length === 0 || 
      selectedSkills.every(skill => (career.required_skills || []).includes(skill));
    const matchesIndustry = !industryFilter || career.industry === industryFilter;
    const matchesSalary = !salaryFilter || career.salary_range === salaryFilter;
    const matchesEducation = !educationFilter || 
      (career.required_education || []).includes(educationFilter);
    const matchesField = !fieldFilter || career.industry === fieldFilter;

    return matchesSearch && matchesSkills && matchesIndustry && 
           matchesSalary && matchesEducation && matchesField;
  });

  // Calculate pagination
  const totalPages = Math.ceil((filteredCareers?.length || 0) / CAREERS_PER_PAGE);
  const startIndex = (currentPage - 1) * CAREERS_PER_PAGE;
  const paginatedCareers = filteredCareers?.slice(startIndex, startIndex + CAREERS_PER_PAGE);

  return (
    <SidebarProvider>
      <div className="app-layout">
        <MenuSidebar />
        <div className="main-content">
          <div className="px-4 md:px-8 py-8 max-w-7xl mx-auto w-full">
            <div className="space-y-8">
              <h1 className="text-3xl font-bold">PicoCareer Careers</h1>
              
              <CommunityFilters
                searchQuery={searchQuery}
                onSearchChange={setSearchQuery}
                selectedSkills={selectedSkills}
                onSkillsChange={setSelectedSkills}
                locationFilter={industryFilter}
                onLocationChange={setIndustryFilter}
                companyFilter={salaryFilter}
                onCompanyChange={setSalaryFilter}
                schoolFilter={educationFilter}
                onSchoolChange={setEducationFilter}
                fieldFilter={fieldFilter}
                onFieldChange={setFieldFilter}
                locations={industries}
                companies={salaryRanges}
                schools={educationLevels}
                fields={fields}
                allSkills={allSkills}
              />

              {error ? (
                <div className="text-center py-8">
                  <p className="text-destructive">Failed to load careers.</p>
                  <button 
                    onClick={() => window.location.reload()} 
                    className="mt-4 text-primary hover:underline"
                  >
                    Try refreshing the page
                  </button>
                </div>
              ) : isLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {[...Array(6)].map((_, i) => (
                    <div key={i} className="p-6 rounded-lg border bg-card">
                      <div className="flex items-start gap-4">
                        <Skeleton className="h-16 w-16 rounded-lg" />
                        <div className="flex-1">
                          <Skeleton className="h-4 w-3/4 mb-2" />
                          <Skeleton className="h-3 w-1/2" />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {paginatedCareers?.map((career) => (
                      <CareerCard 
                        key={career.id}
                        id={career.id}
                        title={career.title}
                        description={career.description}
                        salary_range={career.salary_range}
                        average_salary={career.average_salary}
                        image_url={career.image_url}
                      />
                    ))}
                  </div>
                  
                  {totalPages > 1 && (
                    <BlogPagination
                      currentPage={currentPage}
                      totalPages={totalPages}
                      onPageChange={setCurrentPage}
                    />
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </SidebarProvider>
  );
}