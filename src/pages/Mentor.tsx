
import { Home, BookOpen, Users, RefreshCw, Search, GraduationCap, Award, ChevronRight } from "lucide-react";
import { useState, useEffect } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { MenuSidebar } from "@/components/MenuSidebar";
import { SidebarProvider } from "@/components/ui/sidebar";
import { MentorGrid } from "@/components/community/MentorGrid";
import { ProfileDetailsDialog } from "@/components/ProfileDetailsDialog";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { addDays } from "date-fns";
import { MentorFilters } from "@/components/mentors/MentorFilters";

export default function Mentor() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
  const [locationFilter, setLocationFilter] = useState<string>("all");
  const [companyFilter, setCompanyFilter] = useState<string>("all");
  const [schoolFilter, setSchoolFilter] = useState<string>("all");
  const [majorFilter, setMajorFilter] = useState<string>("all");
  const [educationFilter, setEducationFilter] = useState<string>("all");
  const [experienceFilter, setExperienceFilter] = useState<string>("all");
  const [ratingFilter, setRatingFilter] = useState<string>("all");
  const [sessionFilter, setSessionFilter] = useState<string>("all");
  const [hasAvailabilityFilter, setHasAvailabilityFilter] = useState(false);
  const { toast } = useToast();
  const [searchParams, setSearchParams] = useSearchParams();
  const [isProfileDialogOpen, setIsProfileDialogOpen] = useState(false);
  const [isAdvancedSearch, setIsAdvancedSearch] = useState(false);
  const profileId = searchParams.get('profileId');
  const showDialog = searchParams.get('dialog') === 'true';

  useEffect(() => {
    if (profileId && showDialog) {
      setIsProfileDialogOpen(true);
    }
  }, [profileId, showDialog]);

  const { data: profiles = [], isLoading, error } = useQuery({
    queryKey: [
      'profiles', 
      searchQuery, 
      selectedSkills, 
      locationFilter, 
      companyFilter, 
      schoolFilter, 
      majorFilter,
      educationFilter,
      experienceFilter,
      ratingFilter,
      sessionFilter,  
      hasAvailabilityFilter
    ],
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

      if (locationFilter && locationFilter !== "all") {
        query = query.eq('location', locationFilter);
      }

      if (companyFilter && companyFilter !== "all") {
        query = query.eq('company_id', companyFilter);
      }

      if (schoolFilter && schoolFilter !== "all") {
        query = query.eq('school_id', schoolFilter);
      }
      
      if (majorFilter && majorFilter !== "all") {
        query = query.eq('academic_major_id', majorFilter);
      }
      
      if (educationFilter && educationFilter !== "all") {
        query = query.eq('highest_degree', educationFilter);
      }
      
      if (experienceFilter && experienceFilter !== "all") {
        // Parse ranges like "1-3", "4-7", "8-10", "10+"
        if (experienceFilter === "10+") {
          query = query.gte('years_of_experience', 10);
        } else {
          const [min, max] = experienceFilter.split('-').map(Number);
          query = query.gte('years_of_experience', min).lte('years_of_experience', max);
        }
      }

      if (sessionFilter && sessionFilter !== "all") {
        // Parse values like "10+", "50+", "100+"
        const minSessions = parseInt(sessionFilter.replace('+', ''));
        query = query.gte('total_booked_sessions', minSessions);
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
      
      // Handle rating filter for the client-side (since ratings might be in another table)
      let filteredData = data;
      if (ratingFilter && ratingFilter !== "all") {
        const minRating = parseFloat(ratingFilter.replace('+', ''));
        // This is a placeholder - in a real app, you'd join with ratings table
        // For now, we'll simulate by filtering randomly
        filteredData = data.filter(profile => {
          // This is a placeholder simulation - replace with actual rating logic
          const rating = (profile.id.charCodeAt(0) % 5) + 1; // Random rating between 1-5
          return rating >= minRating;
        });
      }

      return filteredData.map((profile: any) => ({
        ...profile,
        company_name: profile.company?.name,
        school_name: profile.school?.name,
        academic_major: profile.academic_major?.title,
        career_title: profile.career?.title,
        hasAvailability: mentorsWithAvailability.has(profile.id),
        // Placeholder for rating, replace with actual ratings from your system
        rating: (profile.id.charCodeAt(0) % 5) + 1,
        totalRatings: profile.id.charCodeAt(1) % 100
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
              <div className="relative overflow-hidden rounded-xl mb-12 shadow-lg">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-700 to-blue-500 opacity-90"></div>
                
                <div className="relative p-6 md:p-8 lg:p-10 flex flex-col md:flex-row gap-8 items-center">
                  <div className="flex-1 z-10">
                    <span className="inline-flex items-center gap-2 text-white/90 font-medium px-3 py-1.5 rounded-full bg-white/20 w-fit mb-3">
                      <GraduationCap className="h-4 w-4" /> Join Our Mentor Community
                    </span>
                    
                    <h2 className="text-2xl sm:text-3xl font-bold text-white leading-tight mb-3">
                      Share Your Expertise as a Mentor
                    </h2>
                    
                    <p className="text-white/90 text-base sm:text-lg max-w-lg mb-4">
                      Guide aspiring professionals, build your network, and make a meaningful impact 
                      while enhancing your own leadership skills.
                    </p>
                    
                    <div className="flex flex-wrap gap-4 mb-6">
                      <div className="flex items-center gap-2 bg-white/10 px-3 py-2 rounded-lg">
                        <Award className="h-5 w-5 text-yellow-300" />
                        <span className="text-white font-medium">Build Your Reputation</span>
                      </div>
                      <div className="flex items-center gap-2 bg-white/10 px-3 py-2 rounded-lg">
                        <Users className="h-5 w-5 text-blue-200" />
                        <span className="text-white font-medium">Expand Your Network</span>
                      </div>
                      <div className="flex items-center gap-2 bg-white/10 px-3 py-2 rounded-lg">
                        <BookOpen className="h-5 w-5 text-green-200" />
                        <span className="text-white font-medium">Share Knowledge</span>
                      </div>
                    </div>
                    
                    <Button 
                      asChild 
                      size="lg" 
                      className="bg-white text-blue-700 hover:bg-blue-50 font-semibold gap-2"
                    >
                      <Link to="/mentor-registration">
                        Become a Mentor
                        <ChevronRight className="h-5 w-5" />
                      </Link>
                    </Button>
                  </div>
                  
                  <div className="md:w-1/3 lg:w-2/5 relative h-56 md:h-64 lg:h-72 z-10">
                    <div className="absolute top-0 left-0 right-0 bottom-0 flex items-center justify-center">
                      <div className="w-full max-w-md aspect-video relative">
                        <div className="absolute inset-0 bg-white/10 backdrop-blur-sm rounded-2xl overflow-hidden border border-white/20 shadow-xl rotate-3 animate-float">
                          <img 
                            src="https://images.unsplash.com/photo-1461749280684-dccba630e2f6" 
                            alt="Mentor teaching programming" 
                            className="w-full h-full object-cover opacity-90"
                          />
                        </div>
                        <div className="absolute inset-0 bg-white/10 backdrop-blur-sm rounded-2xl overflow-hidden border border-white/20 shadow-xl -rotate-3 animate-float" style={{animationDelay: "0.5s"}}>
                          <img 
                            src="https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d" 
                            alt="Person mentoring" 
                            className="w-full h-full object-cover opacity-90"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <h1 className="text-3xl font-bold">PicoCareer Mentors</h1>

              <div className="bg-card border rounded-lg shadow-sm">
                <MentorFilters
                  searchQuery={searchQuery}
                  setSearchQuery={setSearchQuery}
                  companyFilter={companyFilter}
                  setCompanyFilter={setCompanyFilter}
                  educationFilter={educationFilter}
                  setEducationFilter={setEducationFilter}
                  experienceFilter={experienceFilter}
                  setExperienceFilter={setExperienceFilter}
                  sessionFilter={sessionFilter}
                  setSessionFilter={setSessionFilter}
                  majorFilter={majorFilter}
                  setMajorFilter={setMajorFilter}
                  schoolFilter={schoolFilter}
                  setSchoolFilter={setSchoolFilter}
                  ratingFilter={ratingFilter}
                  setRatingFilter={setRatingFilter}
                  availabilityFilter={hasAvailabilityFilter}
                  setAvailabilityFilter={setHasAvailabilityFilter}
                  locationFilter={locationFilter}
                  setLocationFilter={setLocationFilter}
                />
              </div>
              
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
