
import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { CareerFilters } from "@/components/career/CareerFilters";
import { CareerResults } from "@/components/career/CareerResults";
import { motion } from "framer-motion";
import type { Tables } from "@/integrations/supabase/types";

const Career = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [industryFilter, setIndustryFilter] = useState("all");
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
  const [isSkillsDropdownOpen, setIsSkillsDropdownOpen] = useState(false);
  const [skillSearchQuery, setSkillSearchQuery] = useState("");
  const [popularFilter, setPopularFilter] = useState("all");

  // Fetch careers
  const { data: careers = [], isLoading } = useQuery({
    queryKey: ['careers'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('careers')
        .select('*')
        .eq('complete_career', true)
        .order('title');
      
      if (error) throw error;
      return data as Tables<"careers">[];
    },
  });

  // Get unique industries for filter
  const industries = Array.from(
    new Set(
      careers
        .map(career => career.industry)
        .filter(Boolean)
    )
  ).sort();

  // Get all skills for filter
  const allSkills = Array.from(
    new Set(
      careers
        .flatMap(career => [
          ...(career.required_skills || []),
          ...(career.transferable_skills || [])
        ])
        .filter(Boolean)
    )
  ).sort();

  // Filter careers based on selected filters
  const filteredCareers = careers.filter(career => {
    // Search query filter
    if (searchQuery && !career.title.toLowerCase().includes(searchQuery.toLowerCase()) &&
        !career.description?.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false;
    }

    // Industry filter
    if (industryFilter !== "all" && career.industry !== industryFilter) {
      return false;
    }

    // Skills filter
    if (selectedSkills.length > 0) {
      const careerSkills = [
        ...(career.required_skills || []),
        ...(career.transferable_skills || [])
      ];
      const hasSelectedSkill = selectedSkills.some(skill => 
        careerSkills.some(careerSkill => 
          careerSkill.toLowerCase().includes(skill.toLowerCase())
        )
      );
      if (!hasSelectedSkill) return false;
    }

    // Popular filter
    if (popularFilter === "popular" && !career.popular) return false;
    if (popularFilter === "rare" && !career.rare) return false;
    if (popularFilter === "new" && !career.new_career) return false;

    return true;
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white">
      <div className="container mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8"
        >
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Explore Career Paths
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl">
            Discover career opportunities that match your interests and skills. 
            Filter by industry, required skills, and career type to find your perfect path.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="mb-8"
        >
          <CareerFilters
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            industryFilter={industryFilter}
            setIndustryFilter={setIndustryFilter}
            selectedSkills={selectedSkills}
            setSelectedSkills={setSelectedSkills}
            isSkillsDropdownOpen={isSkillsDropdownOpen}
            setIsSkillsDropdownOpen={setIsSkillsDropdownOpen}
            skillSearchQuery={skillSearchQuery}
            setSkillSearchQuery={setSkillSearchQuery}
            popularFilter={popularFilter}
            setPopularFilter={setPopularFilter}
            industries={industries}
            allSkills={allSkills}
          />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <div className="mb-4 text-sm text-gray-600">
            Showing {filteredCareers.length} of {careers.length} careers
          </div>
          
          <CareerResults
            filteredCareers={filteredCareers}
            isLoading={isLoading}
          />
        </motion.div>
      </div>
    </div>
  );
};

export default Career;
