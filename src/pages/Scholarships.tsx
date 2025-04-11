
import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { MenuSidebar } from "@/components/MenuSidebar";
import { SidebarProvider } from "@/components/ui/sidebar";
import { ScholarshipGrid } from "@/components/scholarships/ScholarshipGrid";
import { ScholarshipFilters } from "@/components/scholarships/ScholarshipFilters";
import { Button } from "@/components/ui/button";
import { Plus, School, Trophy } from "lucide-react";
import { Link } from "react-router-dom";
import { useAuthState } from "@/hooks/useAuthState";

interface Filters {
  search?: string;
  category?: string;
  amount?: string;
  status?: string;
  deadline?: Date;
  // Advanced filters
  citizenship?: string[];
  demographic?: string[];
  academic_year?: string[];
  major?: string[];
  gpa_requirement?: string;
  renewable?: boolean;
  award_frequency?: string;
  application_process_length?: string;
}

export default function Scholarships() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { toast } = useToast();
  const { user, session } = useAuthState();
  const [filters, setFilters] = useState<Filters>({
    status: "Active",
  });

  // Get unique categories for filtering
  const { data: categories = [] } = useQuery({
    queryKey: ["scholarship-categories"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("scholarships")
        .select("category")
        .eq("status", "Active");

      if (error) {
        console.error("Error fetching categories:", error);
        return [];
      }

      // Extract and flatten all categories, then get unique values
      const allCategories = data
        .flatMap((scholarship) => scholarship.category || [])
        .filter(Boolean);

      return [...new Set(allCategories)];
    },
  });

  // Main query for scholarships
  const { data: scholarships = [], isLoading } = useQuery({
    queryKey: ["scholarships", filters],
    queryFn: async () => {
      let query = supabase.from("scholarships").select("*");

      // Apply filters
      if (filters.status && filters.status !== "all") {
        query = query.eq("status", filters.status);
      }

      if (filters.search) {
        query = query.or(
          `title.ilike.%${filters.search}%,description.ilike.%${filters.search}%,provider_name.ilike.%${filters.search}%`
        );
      }

      if (filters.category && filters.category !== "all") {
        query = query.contains("category", [filters.category]);
      }

      if (filters.amount && filters.amount !== "all") {
        switch (filters.amount) {
          case "under5000":
            query = query.lt("amount", 5000);
            break;
          case "5000-10000":
            query = query.gte("amount", 5000).lte("amount", 10000);
            break;
          case "10000-25000":
            query = query.gte("amount", 10000).lte("amount", 25000);
            break;
          case "over25000":
            query = query.gt("amount", 25000);
            break;
          case "fulltuition":
            query = query.contains("tags", ["full tuition"]);
            break;
        }
      }

      if (filters.deadline) {
        query = query.lte("deadline", filters.deadline.toISOString());
      }

      // Apply advanced filters
      if (filters.citizenship && filters.citizenship.length > 0) {
        query = query.overlaps("citizenship_requirements", filters.citizenship);
      }

      if (filters.demographic && filters.demographic.length > 0) {
        query = query.overlaps("demographic_requirements", filters.demographic);
      }

      // Apply academic filters through eligibility_criteria JSONB field
      if ((filters.academic_year && filters.academic_year.length > 0) || 
          (filters.major && filters.major.length > 0) ||
          filters.gpa_requirement) {
            
        if (filters.academic_year && filters.academic_year.length > 0) {
          query = query.filter('eligibility_criteria->academic_year', 'cs', `{${filters.academic_year.join(',')}}`);
        }
        
        if (filters.major && filters.major.length > 0) {
          query = query.filter('eligibility_criteria->major', 'cs', `{${filters.major.join(',')}}`);
        }
        
        if (filters.gpa_requirement) {
          // For GPA, we need to compare as numbers, not exact match
          const minGpa = parseFloat(filters.gpa_requirement);
          query = query.gte('eligibility_criteria->>gpa_requirement', minGpa);
        }
      }

      if (filters.renewable !== undefined) {
        query = query.eq("renewable", filters.renewable);
      }

      if (filters.award_frequency) {
        query = query.eq("award_frequency", filters.award_frequency);
      }

      // Order by featured first, then deadline (upcoming first)
      query = query.order("featured", { ascending: false }).order("deadline", { ascending: true });

      const { data, error } = await query;

      if (error) {
        console.error("Error fetching scholarships:", error);
        toast({
          title: "Error",
          description: "Failed to load scholarships. Please try again.",
          variant: "destructive",
        });
        return [];
      }

      // For application_process_length, filter client-side since it's a calculated property
      if (filters.application_process_length) {
        // This is a simplified approach - in a real app, you would need more sophisticated logic
        return data.filter(scholarship => {
          const processLength = scholarship.application_process ? scholarship.application_process.length : 0;
          const requiredDocsCount = scholarship.required_documents ? scholarship.required_documents.length : 0;
          
          const complexity = processLength > 500 || requiredDocsCount > 3 
            ? "Complex (1+ hour)" 
            : processLength > 200 || requiredDocsCount > 1 
              ? "Medium (30-60 min)" 
              : "Simple (less than 30 min)";
              
          return complexity === filters.application_process_length;
        });
      }

      return data;
    },
  });

  const handleFilterChange = (newFilters: Filters) => {
    setFilters(newFilters);
  };

  // Get featured scholarships
  const featuredScholarships = scholarships.filter((s) => s.featured);

  return (
    <SidebarProvider>
      <div className="app-layout">
        <MenuSidebar />
        <div className="main-content">
          <div className="px-4 md:px-8 py-8 max-w-7xl mx-auto w-full">
            <div className="space-y-8">
              {/* Header Section */}
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                  <h1 className="text-3xl font-bold flex items-center gap-2">
                    <School className="h-8 w-8 text-blue-500" />
                    Scholarships
                  </h1>
                  <p className="text-muted-foreground mt-1">
                    Find financial support opportunities for your education
                  </p>
                </div>

                {user && (
                  <Button asChild>
                    <Link to="/scholarships/add">
                      <Plus className="h-4 w-4 mr-1" /> Add Scholarship
                    </Link>
                  </Button>
                )}
              </div>

              {/* Featured Scholarships Section */}
              {featuredScholarships.length > 0 && (
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Trophy className="h-5 w-5 text-amber-500" />
                    <h2 className="text-xl font-semibold">Featured Scholarships</h2>
                  </div>
                  <ScholarshipGrid
                    scholarships={featuredScholarships.slice(0, 4)}
                    isLoading={false}
                    compact={true}
                  />
                </div>
              )}

              {/* Filters Section */}
              <ScholarshipFilters
                onFilterChange={handleFilterChange}
                categories={categories}
              />

              {/* Main Grid */}
              <ScholarshipGrid
                scholarships={scholarships}
                isLoading={isLoading}
              />
            </div>
          </div>
        </div>
      </div>
    </SidebarProvider>
  );
}
