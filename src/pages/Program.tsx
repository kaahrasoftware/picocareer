import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { ProfileCard } from "@/components/community/ProfileCard";
import { useState } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { CommunityFilters } from "@/components/community/CommunityFilters";
import { BlogPagination } from "@/components/blog/BlogPagination";
import { MenuSidebar } from "@/components/MenuSidebar";
import { SidebarProvider } from "@/components/ui/sidebar";
import { useToast } from "@/hooks/use-toast";

export default function Program() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
  const [locationFilter, setLocationFilter] = useState<string | null>(null);
  const [companyFilter, setCompanyFilter] = useState<string | null>(null);
  const [schoolFilter, setSchoolFilter] = useState<string | null>(null);
  const [fieldFilter, setFieldFilter] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const PROFILES_PER_PAGE = 15;
  const { toast } = useToast();

  const { data: profiles = [], isLoading, error } = useQuery({
    queryKey: ['profiles'],
    queryFn: async () => {
      console.log('Fetching profiles...');
      const { data: { user } } = await supabase.auth.getUser();
      
      try {
        let query = supabase
          .from('profiles')
          .select(`
            *,
            company:companies(name),
            school:schools(name),
            academic_major:majors!profiles_academic_major_id_fkey(title)
          `)
          .eq('user_type', 'mentor')
          .order('created_at', { ascending: false });

        if (user?.id) {
          query = query.neq('id', user.id);
        }
        
        const { data, error } = await query;
        
        if (error) {
          console.error('Supabase query error:', error);
          throw error;
        }

        console.log('Profiles fetched successfully:', data?.length);
        return data.map(profile => ({
          ...profile,
          company_name: profile.company?.name,
          school_name: profile.school?.name,
          academic_major: profile.academic_major?.title || null
        }));
      } catch (err) {
        console.error('Error in profiles query:', err);
        toast({
          title: "Error loading profiles",
          description: "There was an error loading the community profiles. Please try again later.",
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

  const locations = Array.from(new Set(profiles?.map(p => p.location).filter(Boolean) || [])).sort();
  const companies = Array.from(new Set(profiles?.map(p => p.company_name).filter(Boolean) || [])).sort();
  const schools = Array.from(new Set(profiles?.map(p => p.school_name).filter(Boolean) || [])).sort();
  const fields = Array.from(new Set(profiles?.flatMap(p => p.fields_of_interest || []) || [])).sort();
  const allSkills = Array.from(new Set(profiles?.flatMap(p => p.skills || []) || [])).sort();

  const filteredProfiles = profiles?.filter(profile => {
    const searchableFields = [
      profile.first_name,
      profile.last_name,
      profile.full_name,
      profile.position,
      profile.highest_degree,
      profile.bio,
      profile.location,
      profile.company_name,
      profile.school_name,
      profile.academic_major,
      ...(profile.keywords || []),
      ...(profile.skills || []),
      ...(profile.tools_used || []),
      ...(profile.fields_of_interest || [])
    ].filter(Boolean).map(field => field.toLowerCase());

    const matchesSearch = searchQuery === "" || 
      searchableFields.some(field => field.includes(searchQuery.toLowerCase()));

    const matchesSkills = selectedSkills.length === 0 || 
      selectedSkills.every(skill => (profile.skills || []).includes(skill));
    const matchesLocation = !locationFilter || profile.location === locationFilter;
    const matchesCompany = !companyFilter || profile.company_name === companyFilter;
    const matchesSchool = !schoolFilter || profile.school_name === schoolFilter;
    const matchesField = !fieldFilter || (profile.fields_of_interest || []).includes(fieldFilter);

    return matchesSearch && matchesSkills && matchesLocation && 
           matchesCompany && matchesSchool && matchesField;
  });

  // Calculate pagination
  const totalPages = Math.ceil((filteredProfiles?.length || 0) / PROFILES_PER_PAGE);
  const startIndex = (currentPage - 1) * PROFILES_PER_PAGE;
  const paginatedProfiles = filteredProfiles?.slice(startIndex, startIndex + PROFILES_PER_PAGE);

  return (
    <SidebarProvider>
      <div className="app-layout">
        <MenuSidebar />
        <div className="main-content">
          <div className="px-4 md:px-8 py-8 max-w-7xl mx-auto w-full">
            <div className="space-y-8">
              <h1 className="text-3xl font-bold">PicoCareer Programs</h1>
              
              <CommunityFilters
                searchQuery={searchQuery}
                onSearchChange={setSearchQuery}
                selectedSkills={selectedSkills}
                onSkillsChange={setSelectedSkills}
                locationFilter={locationFilter}
                onLocationChange={setLocationFilter}
                companyFilter={companyFilter}
                onCompanyChange={setCompanyFilter}
                schoolFilter={schoolFilter}
                onSchoolChange={setSchoolFilter}
                fieldFilter={fieldFilter}
                onFieldChange={setFieldFilter}
                locations={locations}
                companies={companies}
                schools={schools}
                fields={fields}
                allSkills={allSkills}
              />

              {error ? (
                <div className="text-center py-8">
                  <p className="text-destructive">Failed to load community profiles.</p>
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
                        <Skeleton className="h-16 w-16 rounded-full" />
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
                    {paginatedProfiles?.map((profile) => (
                      <ProfileCard key={profile.id} profile={profile} />
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