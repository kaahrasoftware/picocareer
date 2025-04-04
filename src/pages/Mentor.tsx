
import { Home, BookOpen, Users, RefreshCw, Search, GraduationCap, Award } from "lucide-react";
import { useState, useEffect } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { CommunityFilters } from "@/components/community/CommunityFilters";
import { MenuSidebar } from "@/components/MenuSidebar";
import { SidebarProvider } from "@/components/ui/sidebar";
import { MentorGrid } from "@/components/community/MentorGrid";
import { ProfileDetailsDialog } from "@/components/ProfileDetailsDialog";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
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
            <div className="space-y-12">
              {/* Become a Mentor Section - Mobile Friendly Improvements */}
              <div className="relative overflow-hidden rounded-xl mb-12">
                <div className="absolute inset-0 bg-gradient-to-r from-picocareer-dark to-picocareer-primary opacity-80"></div>
                <div className="absolute inset-0 w-full h-full bg-white/10 backdrop-blur-sm"></div>
                
                <div className="relative p-4 sm:p-6 md:p-8">
                  <div className="flex flex-col gap-6 md:gap-8">
                    <div className="flex flex-col justify-center space-y-4">
                      <div className="inline-flex items-center gap-2 text-white/90 font-medium px-3 py-1.5 rounded-full bg-white/20 w-fit mb-2">
                        <GraduationCap className="h-4 w-4" /> Join Our Community
                      </div>
                      <h2 className="text-2xl sm:text-3xl font-bold text-white leading-tight">Share Your Expertise as a PicoCareer Mentor</h2>
                      <p className="text-white/80 text-base sm:text-lg max-w-lg">
                        Guide aspiring professionals, build your network, and make a meaningful impact while enhancing your own leadership skills.
                      </p>
                      <div className="pt-4 flex flex-col sm:flex-row gap-4">
                        <Button 
                          asChild 
                          size="lg" 
                          className="bg-white text-picocareer-dark hover:bg-gray-100 font-semibold w-full sm:w-auto"
                        >
                          <Link to="/mentor-registration" className="flex items-center justify-center">
                            <GraduationCap className="mr-2 h-5 w-5" />
                            Become a Mentor
                          </Link>
                        </Button>
                      </div>
                    </div>
                    
                    <div className="flex flex-wrap gap-4 justify-center sm:justify-start">
                      <div className="flex items-center gap-2">
                        <div className="w-10 h-10 rounded-full flex items-center justify-center bg-white/20">
                          <Award className="h-5 w-5 text-white" />
                        </div>
                        <span className="text-white/90 text-sm">Recognition</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-10 h-10 rounded-full flex items-center justify-center bg-white/20">
                          <Users className="h-5 w-5 text-white" />
                        </div>
                        <span className="text-white/90 text-sm">Community</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-10 h-10 rounded-full flex items-center justify-center bg-white/20">
                          <BookOpen className="h-5 w-5 text-white" />
                        </div>
                        <span className="text-white/90 text-sm">Knowledge</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="hidden md:block">
                    <div className="relative w-full max-w-md aspect-square">
                      <div className="absolute inset-0 w-full h-full bg-white/10 backdrop-blur-sm rounded-2xl overflow-hidden border border-white/20 shadow-xl transform rotate-3 animate-float">
                        <img 
                          src="https://images.unsplash.com/photo-1461749280684-dccba630e2f6" 
                          alt="Mentor teaching programming" 
                          className="w-full h-full object-cover opacity-80"
                        />
                      </div>
                      <div className="absolute inset-0 w-full h-full bg-white/10 backdrop-blur-sm rounded-2xl overflow-hidden border border-white/20 shadow-xl -rotate-3 animate-float" style={{animationDelay: "0.5s"}}>
                        <img 
                          src="https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d" 
                          alt="Person mentoring" 
                          className="w-full h-full object-cover opacity-80"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

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
