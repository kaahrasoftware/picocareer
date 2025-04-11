
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
