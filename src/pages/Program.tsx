import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useState } from "react";
import { CommunityFilters } from "@/components/community/CommunityFilters";
import { BlogPagination } from "@/components/blog/BlogPagination";
import { MenuSidebar } from "@/components/MenuSidebar";
import { SidebarProvider } from "@/components/ui/sidebar";
import { useToast } from "@/hooks/use-toast";
import { MajorCard } from "@/components/MajorCard";

export default function Program() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
  const [degreeFilter, setDegreeFilter] = useState<string | null>(null);
  const [gpaFilter, setGpaFilter] = useState<string | null>(null);
  const [courseFilter, setCourseFilter] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const MAJORS_PER_PAGE = 9;
  const { toast } = useToast();

  const { data: majors = [], isLoading, error } = useQuery({
    queryKey: ['majors'],
    queryFn: async () => {
      try {
        const { data, error } = await supabase
          .from('majors')
          .select('*')
          .eq('status', 'Approved')
          .order('created_at', { ascending: false });

        if (error) throw error;
        return data;
      } catch (err) {
        console.error('Error fetching majors:', err);
        toast({
          title: "Error loading majors",
          description: "There was an error loading the majors. Please try again later.",
          variant: "destructive",
        });
        throw err;
      }
    },
    retry: 2,
    retryDelay: 1000,
  });

  const filteredMajors = majors?.filter(major => {
    const searchableFields = [
      major.title,
      major.description,
      ...(major.common_courses || []),
      ...(major.skill_match || []),
      ...(major.tools_knowledge || []),
    ].filter(Boolean).map(field => field.toLowerCase());

    const matchesSearch = searchQuery === "" || 
      searchableFields.some(field => field.includes(searchQuery.toLowerCase()));

    const matchesSkills = selectedSkills.length === 0 || 
      selectedSkills.every(skill => (major.skill_match || []).includes(skill));

    const matchesDegree = !degreeFilter || 
      (major.degree_levels || []).includes(degreeFilter);

    const matchesGPA = !gpaFilter || (
      gpaFilter === "3.5+" ? (major.gpa_expectations || 0) >= 3.5 :
      gpaFilter === "3.0-3.5" ? (major.gpa_expectations || 0) >= 3.0 && (major.gpa_expectations || 0) < 3.5 :
      (major.gpa_expectations || 0) < 3.0
    );

    const matchesCourse = !courseFilter || 
      (major.common_courses || []).some(course => 
        course.toLowerCase().includes(courseFilter.toLowerCase())
      );

    return matchesSearch && matchesSkills && matchesDegree && 
           matchesGPA && matchesCourse;
  });

  // Calculate pagination
  const totalPages = Math.ceil((filteredMajors?.length || 0) / MAJORS_PER_PAGE);
  const startIndex = (currentPage - 1) * MAJORS_PER_PAGE;
  const paginatedMajors = filteredMajors?.slice(startIndex, startIndex + MAJORS_PER_PAGE);

  // Get unique values for filters
  const allSkills = Array.from(new Set(majors?.flatMap(m => m.skill_match || []) || [])).sort();
  const degreeTypes = Array.from(new Set(majors?.flatMap(m => m.degree_levels || []) || [])).sort();
  const courses = Array.from(new Set(majors?.flatMap(m => m.common_courses || []) || [])).sort();

  return (
    <SidebarProvider>
      <div className="app-layout">
        <MenuSidebar />
        <div className="main-content">
          <div className="px-4 md:px-8 py-8 max-w-7xl mx-auto w-full">
            <div className="space-y-8">
              <div className="sticky top-0 z-10 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 transition-all duration-200 pb-4">
                <div className="transform transition-transform duration-200 py-2">
                  <h1 className="text-xl font-bold">Academic Programs</h1>
                </div>
                
                <div className="transform transition-all duration-200 -mx-2">
                  <CommunityFilters
                    searchQuery={searchQuery}
                    onSearchChange={setSearchQuery}
                    selectedSkills={selectedSkills}
                    onSkillsChange={setSelectedSkills}
                    locationFilter={degreeFilter}
                    onLocationChange={setDegreeFilter}
                    companyFilter={gpaFilter}
                    onCompanyChange={setGpaFilter}
                    schoolFilter={courseFilter}
                    onSchoolChange={setCourseFilter}
                    locations={degreeTypes}
                    companies={["3.5+", "3.0-3.5", "below-3.0"]}
                    schools={courses}
                    fields={[]}
                    allSkills={allSkills}
                  />
                </div>
              </div>

              {error ? (
                <div className="text-center py-8">
                  <p className="text-destructive">Failed to load academic programs.</p>
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
                    <div key={i} className="h-[300px] rounded-lg border bg-card animate-pulse" />
                  ))}
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {paginatedMajors?.map((major) => (
                      <MajorCard key={major.id} {...major} />
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