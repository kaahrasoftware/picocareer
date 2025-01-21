import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useState } from "react";
import { CommunityFilters } from "@/components/community/CommunityFilters";
import { MenuSidebar } from "@/components/MenuSidebar";
import { SidebarProvider } from "@/components/ui/sidebar";
import { useToast } from "@/hooks/use-toast";
import { MajorCard } from "@/components/MajorCard";
import { LoadMoreButton } from "@/components/community/LoadMoreButton";

export default function Program() {
  const [searchQuery, setSearchQuery] = useState("");
  const [fieldFilter, setFieldFilter] = useState<string | null>(null);
  const [displayCount, setDisplayCount] = useState(12);
  const { toast } = useToast();

  const { data: majors = [], isLoading, error } = useQuery({
    queryKey: ['majors'],
    queryFn: async () => {
      try {
        console.log('Fetching majors...');
        const { data, error } = await supabase
          .from('majors')
          .select('*')
          .eq('status', 'Approved')
          .order('created_at', { ascending: false });

        if (error) {
          console.error('Supabase error:', error);
          throw error;
        }

        console.log('Fetched majors:', data);
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
      ...(major.learning_objectives || []),
      ...(major.common_courses || []),
      ...(major.interdisciplinary_connections || []),
      major.job_prospects,
      ...(major.certifications_to_consider || []),
      ...(major.degree_levels || []),
      ...(major.affiliated_programs || []),
      ...(major.transferable_skills || []),
      ...(major.tools_knowledge || []),
      major.passion_for_subject,
      ...(major.skill_match || []),
      ...(major.professional_associations || []),
      major.global_applicability,
      ...(major.common_difficulties || []),
      ...(major.majors_to_consider_switching_to || []),
      ...(major.career_opportunities || []),
      major.intensity,
      major.stress_level,
      major.dropout_rates
    ].filter(Boolean).map(field => field.toLowerCase());

    const matchesSearch = searchQuery === "" || 
      searchableFields.some(field => field.includes(searchQuery.toLowerCase()));

    const matchesField = !fieldFilter || 
      (major.category || []).includes(fieldFilter);

    return matchesSearch && matchesField;
  });

  const fields = Array.from(new Set(majors?.flatMap(m => m.category || []) || [])).sort();
  const displayedMajors = filteredMajors?.slice(0, displayCount);
  const hasMore = displayCount < (filteredMajors?.length || 0);

  const handleLoadMore = () => {
    setDisplayCount(prev => Math.min(prev + 3, filteredMajors?.length || 0));
  };

  return (
    <SidebarProvider>
      <div className="app-layout">
        <MenuSidebar />
        <div className="main-content">
          <div className="px-4 md:px-8 py-8 max-w-7xl mx-auto w-full">
            <div className="space-y-8">
              <div className="sticky top-0 z-10 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 transition-all duration-200 pb-4">
                <div className="transform transition-transform duration-200 py-2">
                  <h1 className="text-xl font-bold">Fields of Study</h1>
                </div>
                
                <div className="transform transition-all duration-200 -mx-2">
                  <CommunityFilters
                    searchQuery={searchQuery}
                    onSearchChange={setSearchQuery}
                    fieldFilter={fieldFilter}
                    onFieldChange={setFieldFilter}
                    fields={fields}
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
                <div className="space-y-8">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {displayedMajors?.map((major) => (
                      <MajorCard key={major.id} {...major} />
                    ))}
                  </div>
                  
                  <div className="flex justify-center mt-8">
                    <LoadMoreButton 
                      hasMore={hasMore} 
                      isLoading={isLoading} 
                      onClick={handleLoadMore} 
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </SidebarProvider>
  );
}