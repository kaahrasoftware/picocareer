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
import { addDays } from "date-fns";

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

  useEffect(() => {
    if (profileId && showDialog) {
      setIsProfileDialogOpen(true);
    }
  }, [profileId, showDialog]);

  const { data: profiles = [], isLoading, error } = useQuery({
    queryKey: ['profiles', searchQuery, selectedSkills, locationFilter, companyFilter, schoolFilter, fieldFilter, hasAvailabilityFilter],
    queryFn: async () => {
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
        .eq('onboarding_status', 'Approved');

      if (hasAvailabilityFilter) {
        const now = new Date();
        
        const { data: availableMentors, error: availabilityError } = await supabase
          .from('mentor_availability')
          .select('profile_id')
          .eq('is_available', true)
          .is('booked_session_id', null)
          .or(
            `and(recurring.eq.true),` +
            `and(recurring.eq.false,start_date_time.gt.${now.toISOString()})`
          );

        if (availabilityError) {
          console.error('Error fetching availabilities:', availabilityError);
          throw availabilityError;
        }

        const uniqueMentorIds = [...new Set(availableMentors?.map(m => m.profile_id) || [])];
        
        if (uniqueMentorIds.length > 0) {
          query = query.in('id', uniqueMentorIds);
        } else {
          return [];
        }
      }

      if (searchQuery) {
        query = query.or(
          `first_name.ilike.%${searchQuery}%,` +
          `last_name.ilike.%${searchQuery}%,` +
          `full_name.ilike.%${searchQuery}%,` +
          `bio.ilike.%${searchQuery}%,` +
          `skills.cs.{${searchQuery}},` +
          `tools_used.cs.{${searchQuery}},` +
          `keywords.cs.{${searchQuery}},` +
          `fields_of_interest.cs.{${searchQuery}}`
        );
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

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching profiles:', error);
        throw error;
      }

      const now = new Date();
      const { data: availabilities } = await supabase
        .from('mentor_availability')
        .select('profile_id')
        .eq('is_available', true)
        .is('booked_session_id', null)
        .or(
          `and(recurring.eq.true),` +
          `and(recurring.eq.false,start_date_time.gt.${now.toISOString()})`
        );

      const mentorsWithAvailability = new Set(availabilities?.map(a => a.profile_id) || []);

      return data.map((profile: any) => ({
        ...profile,
        company_name: profile.company?.name,
        school_name: profile.school?.name,
        academic_major: profile.academic_major?.title,
        career_title: profile.career?.title,
        hasAvailability: mentorsWithAvailability.has(profile.id)
      }));
    }
  });

  const handleCloseDialog = () => {
    setIsProfileDialogOpen(false);
    searchParams.delete('dialog');
    searchParams.delete('profileId');
    setSearchParams(searchParams);
  };

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
                hasAvailabilityFilter={hasAvailabilityFilter}
                onHasAvailabilityChange={setHasAvailabilityFilter}
                showAvailabilityFilter={true}
                fields={[]}
                availableMentorsCount={profiles.length}
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
