import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useState, useEffect } from "react";
import { CommunityFilters } from "@/components/community/CommunityFilters";
import { MenuSidebar } from "@/components/MenuSidebar";
import { SidebarProvider } from "@/components/ui/sidebar";
import { useToast } from "@/hooks/use-toast";
import { MentorGrid } from "@/components/community/MentorGrid";
import { ProfileDetailsDialog } from "@/components/ProfileDetailsDialog";
import { useSearchParams } from "react-router-dom";
import type { Profile } from "@/types/database/profiles";

export default function Mentor() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
  const [locationFilter, setLocationFilter] = useState<string | null>(null);
  const [companyFilter, setCompanyFilter] = useState<string | null>(null);
  const [schoolFilter, setSchoolFilter] = useState<string | null>(null);
  const [fieldFilter, setFieldFilter] = useState<string | null>(null);
  const { toast } = useToast();
  const [searchParams, setSearchParams] = useSearchParams();
  const [isProfileDialogOpen, setIsProfileDialogOpen] = useState(false);
  const profileId = searchParams.get('profileId');
  const showDialog = searchParams.get('dialog') === 'true';

  // Effect to handle URL parameters for mentor profile dialog
  useEffect(() => {
    if (profileId && showDialog) {
      const { data: { session } } = supabase.auth.getSession();
      if (!session) {
        toast({
          title: "Authentication Required",
          description: "Please sign in to view mentor details.",
          variant: "destructive",
        });
      }
      setIsProfileDialogOpen(true);
    }
  }, [profileId, showDialog, toast]);

  const handleCloseDialog = () => {
    setIsProfileDialogOpen(false);
    // Remove dialog and profileId parameters from URL
    searchParams.delete('dialog');
    searchParams.delete('profileId');
    setSearchParams(searchParams);
  };

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
            academic_major:majors!profiles_academic_major_id_fkey(title),
            career:careers!profiles_position_fkey(title, id)
          `)
          .eq('user_type', 'mentor')
          .eq('onboarding_status', 'Approved'); // Only fetch approved mentors

        if (searchQuery) {
          query = query.or(
            `first_name.ilike.%${searchQuery}%,` +
            `last_name.ilike.%${searchQuery}%,` +
            `full_name.ilike.%${searchQuery}%,` +
            `bio.ilike.%${searchQuery}%,` +
            `location.ilike.%${searchQuery}%,` +
            `skills.cs.{${searchQuery}},` +
            `tools_used.cs.{${searchQuery}},` +
            `keywords.cs.{${searchQuery}},` +
            `fields_of_interest.cs.{${searchQuery}},` +
            `career.title.ilike.%${searchQuery}%`
          );
        }

        if (user?.id) {
          query = query.neq('id', user.id);
        }
        
        const { data, error } = await query;
        
        if (error) {
          console.error('Supabase query error:', error);
          throw error;
        }

        console.log('Profiles fetched successfully:', data?.length);
        return (data || []).map((profile: any) => ({
          ...profile,
          company_name: profile.company?.name,
          school_name: profile.school?.name,
          academic_major: profile.academic_major?.title,
          career_title: profile.career?.title
        })) as Profile[];
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

  return (
    <SidebarProvider>
      <div className="app-layout">
        <MenuSidebar />
        <div className="main-content">
          <div className="px-4 md:px-8 py-8 max-w-7xl mx-auto w-full">
            <div className="space-y-8">
              <h1 className="text-3xl font-bold">PicoCareer Mentors</h1>
              
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
              ) : (
                <MentorGrid 
                  profiles={filteredProfiles || []} 
                  isLoading={isLoading} 
                />
              )}
            </div>
          </div>
        </div>
      </div>

      {profileId && (
        <ProfileDetailsDialog
          userId={profileId}
          open={isProfileDialogOpen}
          onOpenChange={handleCloseDialog}
        />
      )}
    </SidebarProvider>
  );
}