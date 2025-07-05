import { useState, useEffect, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { CareerFilters } from "@/components/career/CareerFilters";
import { CareerResults } from "@/components/career/CareerResults";
import { CareerDetailsDialog } from "@/components/CareerDetailsDialog";
import { motion } from "framer-motion";
import type { Tables } from "@/integrations/supabase/types";

interface ScoredCareer extends Tables<"careers"> {
  relevanceScore?: number;
}

const Career = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchQuery, setSearchQuery] = useState("");
  const [industryFilter, setIndustryFilter] = useState("all");
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
  const [isSkillsDropdownOpen, setIsSkillsDropdownOpen] = useState(false);
  const [skillSearchQuery, setSkillSearchQuery] = useState("");
  const [popularFilter, setPopularFilter] = useState("all");

  // Dialog state management
  const dialogOpen = searchParams.get("dialog") === "true";
  const selectedCareerId = searchParams.get("careerId");

  const handleDialogOpenChange = (open: boolean) => {
    if (!open) {
      // Remove dialog parameters when closing
      const newSearchParams = new URLSearchParams(searchParams);
      newSearchParams.delete("dialog");
      newSearchParams.delete("careerId");
      setSearchParams(newSearchParams, { replace: true });
    }
  };

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

  // Smart search scoring function
  const calculateRelevanceScore = (career: Tables<"careers">, query: string): number => {
    if (!query.trim()) return 0;

    const queryLower = query.toLowerCase().trim();
    const titleLower = career.title.toLowerCase();
    const descriptionLower = career.description?.toLowerCase() || "";
    
    let score = 0;
    
    // Split query into words for better matching
    const queryWords = queryLower.split(/\s+/);
    
    // Exact title match gets highest score
    if (titleLower === queryLower) {
      score += 1000;
    }
    
    // Title starts with query gets high score
    if (titleLower.startsWith(queryLower)) {
      score += 800;
    }
    
    // Title contains full query gets good score
    if (titleLower.includes(queryLower)) {
      score += 600;
    }
    
    // Individual word matches in title
    queryWords.forEach((word, index) => {
      if (titleLower.includes(word)) {
        // Earlier words in query get higher scores
        const positionBonus = (queryWords.length - index) * 10;
        score += 400 + positionBonus;
        
        // Bonus if word appears at start of title
        if (titleLower.indexOf(word) === 0) {
          score += 200;
        }
      }
    });
    
    // Description matches get lower scores
    if (descriptionLower.includes(queryLower)) {
      score += 200;
    }
    
    queryWords.forEach((word) => {
      if (descriptionLower.includes(word)) {
        score += 100;
      }
    });
    
    // Industry match bonus
    if (career.industry && career.industry.toLowerCase().includes(queryLower)) {
      score += 300;
    }
    
    // Skills match bonus
    const allCareerSkills = [
      ...(career.required_skills || []),
      ...(career.transferable_skills || [])
    ].map(skill => skill.toLowerCase());
    
    queryWords.forEach((word) => {
      allCareerSkills.forEach((skill) => {
        if (skill.includes(word)) {
          score += 150;
        }
      });
    });
    
    return score;
  };

  // Enhanced filtering with search prioritization
  const filteredCareers = useMemo(() => {
    let filtered = careers.filter(career => {
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

    // Apply search scoring and sorting
    if (searchQuery.trim()) {
      // Calculate relevance scores and filter out non-matching careers
      const scoredCareers: ScoredCareer[] = filtered
        .map(career => ({
          ...career,
          relevanceScore: calculateRelevanceScore(career, searchQuery)
        }))
        .filter(career => career.relevanceScore! > 0);

      // Sort by relevance score (highest first)
      return scoredCareers.sort((a, b) => b.relevanceScore! - a.relevanceScore!);
    }

    // No search query - return alphabetically sorted
    return filtered.sort((a, b) => a.title.localeCompare(b.title));
  }, [careers, searchQuery, industryFilter, selectedSkills, popularFilter]);

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
            {searchQuery && (
              <span className="ml-2 text-blue-600">
                (sorted by relevance)
              </span>
            )}
          </div>
          
          <CareerResults
            filteredCareers={filteredCareers}
            isLoading={isLoading}
          />
        </motion.div>
      </div>

      {/* Career Details Dialog */}
      {selectedCareerId && (
        <CareerDetailsDialog
          careerId={selectedCareerId}
          open={dialogOpen}
          onOpenChange={handleDialogOpenChange}
        />
      )}
    </div>
  );
};

export default Career;
