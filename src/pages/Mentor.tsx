import { Home, BookOpen, Users, RefreshCw, Search } from "lucide-react";
import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { CommunityFilters } from "@/components/community/CommunityFilters";
import { MenuSidebar } from "@/components/MenuSidebar";
import { SidebarProvider } from "@/components/ui/sidebar";
import { MentorGrid } from "@/components/community/MentorGrid";
import { ProfileDetailsDialog } from "@/components/ProfileDetailsDialog";

export default function Mentor() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
  const [locationFilter, setLocationFilter] = useState<string | null>(null);
  const [companyFilter, setCompanyFilter] = useState<string | null>(null);
  const [schoolFilter, setSchoolFilter] = useState<string | null>(null);
  const [fieldFilter, setFieldFilter] = useState<string | null>(null);
  const [hasAvailabilityFilter, setHasAvailabilityFilter] = useState(false);
  const { toast } = useToast();
  const [searchParams, setSearchParams] = useSearchParams();
  const [isProfileDialogOpen, setIsProfileDialogOpen] = useState(false);
  const profileId = searchParams.get('profileId');
  const showDialog = searchParams.get('dialog') === 'true';

  // Effect to handle URL parameters for mentor profile dialog
  useEffect(() => {
    const checkSession = async () => {
      if (profileId && showDialog) {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
          toast({
            title: "Authentication Required",
            description: "Please sign in to view mentor details.",
            variant: "destructive",
          });
        }
        setIsProfileDialogOpen(true);
      }
    };
    
    checkSession();
  }, [profileId, showDialog, toast]);

  const handleCloseDialog = () => {
    setIsProfileDialogOpen(false);
    searchParams.delete('dialog');
    searchParams.delete('profileId');
    setSearchParams(searchParams);
  };

  const { data: profiles = [], isLoading, error } = useQuery({
    queryKey: ['profiles', searchQuery, selectedSkills, locationFilter, companyFilter, schoolFilter, fieldFilter, hasAvailabilityFilter],
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
            academic_major:majors(title),
            career:careers(title, id)
          `)
          .eq('user_type', 'mentor')
          .eq('onboarding_status', 'Approved');

        if (hasAvailabilityFilter) {
          const { data: availableProfileIds } = await supabase
            .from('mentor_availability')
            .select('profile_id')
            .eq('is_available', true)
            .not('start_date_time', 'is', null);

          if (availableProfileIds && availableProfileIds.length > 0) {
            query = query.in('id', availableProfileIds.map(item => item.profile_id));
          } else {
            // If no profiles have availability, return empty result
            return [];
          }
        }

        if (user?.id) {
          query = query.neq('id', user.id);
        }

        if (locationFilter) {
          query = query.eq('location', locationFilter);
        }

        if (companyFilter) {
          query = query.eq('company_id', companyFilter);
        }

        if (schoolFilter) {
          query = query.eq('school_id', schoolFilter);
        }

        if (fieldFilter) {
          query = query.contains('fields_of_interest', [fieldFilter]);
        }

        if (selectedSkills.length > 0) {
          query = query.contains('skills', selectedSkills);
        }

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
            `fields_of_interest.cs.{${searchQuery}}`
          );
        }
        
        const { data, error } = await query;
        
        if (error) {
          console.error('Supabase query error:', error);
          throw error;
        }

        // Transform the data to include the proper company and school names
        const transformedData = data?.map(profile => ({
          ...profile,
          company_name: profile.company?.[0]?.name,
          school_name: profile.school?.[0]?.name,
          academic_major: profile.academic_major?.[0]?.title,
          career_title: profile.career?.[0]?.title
        })) || [];

        console.log('Profiles fetched successfully:', transformedData.length);
        return transformedData;
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
                hasAvailabilityFilter={hasAvailabilityFilter}
                onHasAvailabilityChange={setHasAvailabilityFilter}
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
                  profiles={profiles} 
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