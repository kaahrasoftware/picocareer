import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { ProfileCard } from "@/components/community/ProfileCard";
import { useState } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { CommunityFilters } from "@/components/community/CommunityFilters";
import { BlogPagination } from "@/components/blog/BlogPagination";
import { MenuSidebar } from "@/components/MenuSidebar";
import { SidebarProvider } from "@/components/ui/sidebar";
import { useNavigate } from "react-router-dom";

export default function Community() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
  const [userTypeFilter, setUserTypeFilter] = useState<string | null>(null);
  const [locationFilter, setLocationFilter] = useState<string | null>(null);
  const [companyFilter, setCompanyFilter] = useState<string | null>(null);
  const [schoolFilter, setSchoolFilter] = useState<string | null>(null);
  const [fieldFilter, setFieldFilter] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const PROFILES_PER_PAGE = 15;
  const navigate = useNavigate();

  const { data: profiles = [], isLoading } = useQuery({
    queryKey: ['profiles'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      let query = supabase
        .from('profiles')
        .select(`
          *,
          company:companies(name),
          school:schools(name),
          academic_major:majors!profiles_academic_major_id_fkey(title)
        `)
        .neq('user_type', 'admin')
        .order('created_at', { ascending: false });

      if (user?.id) {
        query = query.neq('id', user.id);
      }
      
      const { data, error } = await query;
      
      if (error) throw error;
      return data.map(profile => ({
        ...profile,
        company_name: profile.company?.name,
        school_name: profile.school?.name,
        academic_major: profile.academic_major?.title || null
      }));
    },
  });

  const locations = Array.from(new Set(profiles?.map(p => p.location).filter(Boolean) || [])).sort();
  const companies = Array.from(new Set(profiles?.map(p => p.company_name).filter(Boolean) || [])).sort();
  const schools = Array.from(new Set(profiles?.map(p => p.school_name).filter(Boolean) || [])).sort();
  const fields = Array.from(new Set(profiles?.flatMap(p => p.fields_of_interest || []) || [])).sort();
  const allSkills = Array.from(new Set(profiles?.flatMap(p => p.skills || []) || [])).sort();

  const filteredProfiles = profiles?.filter(profile => {
    const matchesSearch = searchQuery === "" || 
      profile.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (profile.skills || []).some(skill => skill.toLowerCase().includes(searchQuery.toLowerCase())) ||
      profile.company_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      profile.position?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      profile.school_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      profile.location?.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesSkills = selectedSkills.length === 0 || 
      selectedSkills.every(skill => (profile.skills || []).includes(skill));
    const matchesUserType = !userTypeFilter || profile.user_type === userTypeFilter;
    const matchesLocation = !locationFilter || profile.location === locationFilter;
    const matchesCompany = !companyFilter || profile.company_name === companyFilter;
    const matchesSchool = !schoolFilter || profile.school_name === schoolFilter;
    const matchesField = !fieldFilter || (profile.fields_of_interest || []).includes(fieldFilter);

    return matchesSearch && matchesSkills && matchesUserType && 
           matchesLocation && matchesCompany && matchesSchool && matchesField;
  });

  // Calculate pagination
  const totalPages = Math.ceil((filteredProfiles?.length || 0) / PROFILES_PER_PAGE);
  const startIndex = (currentPage - 1) * PROFILES_PER_PAGE;
  const paginatedProfiles = filteredProfiles?.slice(startIndex, startIndex + PROFILES_PER_PAGE);

  const companyLinks = [
    { label: "About Us", href: "#" },
    { label: "Contact Us", href: "#" },
    { label: "Privacy Policy", href: "#" },
    { label: "Terms of Service", href: "#" },
  ];

  const otherLinks = [
    { label: "Blog", href: "/blog", onClick: () => navigate("/blog") },
    { label: "How PicoCareer works", href: "#" },
  ];

  const socialLinks = [
    { icon: "tiktok", href: "#" },
    { icon: "youtube", href: "#" },
    { icon: "linkedin", href: "#" },
    { icon: "instagram", href: "#" },
    { icon: "facebook", href: "#" },
  ];

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full">
        <MenuSidebar />
        <div className="p-8 max-w-[1600px] mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-4">Community</h1>
            <p className="text-muted-foreground mb-6">
              Connect with students, mentors, and professionals in your field of interest.
            </p>
            
            <CommunityFilters
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
              selectedSkills={selectedSkills}
              onSkillsChange={setSelectedSkills}
              userTypeFilter={userTypeFilter}
              onUserTypeChange={setUserTypeFilter}
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
          </div>

          {isLoading ? (
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

          <footer className="mt-20 border-t border-border pt-6">
            <div className="max-w-[1400px] mx-auto">
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div>
                  <h4 className="text-sm font-medium mb-2">Company</h4>
                  <ul className="space-y-2">
                    {companyLinks.map((link, index) => (
                      <li key={index}>
                        <a href={link.href} className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                          {link.label}
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h4 className="text-sm font-medium mb-2">Other Links</h4>
                  <ul className="space-y-2">
                    {otherLinks.map((link, index) => (
                      <li key={index}>
                        <a 
                          href={link.href} 
                          onClick={link.onClick}
                          className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                        >
                          {link.label}
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="flex gap-4 mb-6">
                {socialLinks.map((link, index) => (
                  <a
                    key={index}
                    href={link.href}
                    className="text-muted-foreground hover:text-foreground transition-colors"
                  >
                    <i className={`fab fa-${link.icon} w-5 h-5`}></i>
                  </a>
                ))}
              </div>

              <div className="mb-6">
                <div className="relative max-w-md">
                  <input
                    type="email"
                    placeholder="Enter your email"
                    className="w-full px-4 py-2 bg-muted rounded-lg text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                  />
                  <button className="absolute right-2 top-1/2 -translate-y-1/2 px-4 py-1 bg-primary text-primary-foreground text-sm rounded hover:bg-primary/90 transition-colors">
                    Subscribe
                  </button>
                </div>
              </div>
            </div>
          </footer>
        </div>
      </div>
    </SidebarProvider>
  );
}
