
import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { useMentors } from "@/hooks/useMentors";
import { MentorHorizontalFilters } from "@/components/mentors/MentorHorizontalFilters";
import { MentorGrid } from "@/components/mentors/MentorGrid";
import { BecomeAMentorCTA } from "@/components/mentors/BecomeAMentorCTA";
import { MentorStatsSection } from "@/components/mentors/MentorStatsSection";
import { MentorPagination } from "@/components/mentors/MentorPagination";
import { PageLoader } from "@/components/ui/page-loader";
import { Users, Globe, Building } from "lucide-react";

export default function Mentor() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(12);

  // Get filters from URL params
  const searchQuery = searchParams.get("search") || "";
  const companyFilter = searchParams.get("company") || "all";
  const locationFilter = searchParams.get("location") || "all";
  const skillsFilter = searchParams.get("skills") || "all";
  const {
    data: mentors = [],
    isLoading,
    error
  } = useMentors();

  // Filter mentors based on current filters
  const filteredMentors = mentors.filter(mentor => {
    const matchesSearch = mentor.first_name?.toLowerCase().includes(searchQuery.toLowerCase()) || mentor.last_name?.toLowerCase().includes(searchQuery.toLowerCase()) || mentor.position?.toLowerCase().includes(searchQuery.toLowerCase()) || mentor.bio?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCompany = companyFilter === "all" || mentor.company_name?.toLowerCase().includes(companyFilter.toLowerCase());
    const matchesLocation = locationFilter === "all" || mentor.location?.toLowerCase().includes(locationFilter.toLowerCase());
    const matchesSkills = skillsFilter === "all" || mentor.skills?.some(skill => skill.toLowerCase().includes(skillsFilter.toLowerCase()));
    return matchesSearch && matchesCompany && matchesLocation && matchesSkills;
  });

  // Pagination logic
  const totalMentors = filteredMentors.length;
  const totalPages = Math.ceil(totalMentors / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedMentors = filteredMentors.slice(startIndex, startIndex + itemsPerPage);

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, companyFilter, locationFilter, skillsFilter]);

  // Update URL params when filters change
  const updateFilters = (newFilters: Record<string, string>) => {
    const newParams = new URLSearchParams(searchParams);
    Object.entries(newFilters).forEach(([key, value]) => {
      if (value && value !== "all") {
        newParams.set(key, value);
      } else {
        newParams.delete(key);
      }
    });
    setSearchParams(newParams);
  };

  if (isLoading) {
    return <PageLoader isLoading={true} />;
  }

  if (error) {
    return <div className="container mx-auto px-4 py-8">
        <div className="text-center text-red-600">
          Error loading mentors. Please try again later.
        </div>
      </div>;
  }

  return <div className="min-h-screen bg-gray-50">
      {/* Modern Header */}
      <section className="bg-white border-b border-gray-100">
        
      </section>

      <div className="container mx-auto px-4 py-8">
        {/* CTA Section */}
        <BecomeAMentorCTA />

        {/* Stats Section */}
        <MentorStatsSection mentors={mentors} />

        {/* Horizontal Filters - moved below stats section */}
        <div className="sticky top-0 z-20 bg-white/95 backdrop-blur-sm border-b border-gray-100 mb-8">
          <MentorHorizontalFilters 
            searchQuery={searchQuery} 
            companyFilter={companyFilter} 
            locationFilter={locationFilter} 
            skillsFilter={skillsFilter} 
            onFiltersChange={updateFilters} 
            mentors={mentors} 
          />
        </div>

        {/* Results Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-semibold text-gray-900">
              {totalMentors} Mentors Found
            </h2>
            <p className="text-gray-600">
              Showing {startIndex + 1}-{Math.min(startIndex + itemsPerPage, totalMentors)} of {totalMentors} results
            </p>
          </div>
          <div className="flex items-center gap-4">
            <label className="text-sm text-gray-600">Show:</label>
            <select value={itemsPerPage} onChange={e => {
            setItemsPerPage(Number(e.target.value));
            setCurrentPage(1);
          }} className="border border-gray-200 rounded-lg px-3 py-1 text-sm">
              <option value={12}>12</option>
              <option value={24}>24</option>
              <option value={48}>48</option>
            </select>
          </div>
        </div>

        {/* Mentor Grid */}
        <MentorGrid mentors={paginatedMentors} isLoading={isLoading} />

        {/* Pagination */}
        {totalPages > 1 && <MentorPagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} totalItems={totalMentors} itemsPerPage={itemsPerPage} />}
      </div>
    </div>;
}
