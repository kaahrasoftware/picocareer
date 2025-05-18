
import { useState, useEffect } from "react";
import { SchoolCard } from "@/components/SchoolCard";
import { supabase } from "@/integrations/supabase/client";
import { PageLoader } from "@/components/ui/page-loader";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import type { School } from "@/types/database/schools";

interface SchoolsGridProps {
  limit?: number;
  showLoadMore?: boolean;
  filter?: Record<string, any>;
  searchTerm?: string;
}

export function SchoolsGrid({ 
  limit = 6, 
  showLoadMore = true,
  filter = {},
  searchTerm = ""
}: SchoolsGridProps) {
  const [schools, setSchools] = useState<School[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [hasMore, setHasMore] = useState<boolean>(false);
  const [page, setPage] = useState<number>(1);
  const { toast } = useToast();

  useEffect(() => {
    // Reset when filter or search changes
    setSchools([]);
    setPage(1);
    setIsLoading(true);
    fetchSchools(1);
  }, [JSON.stringify(filter), searchTerm]);

  const fetchSchools = async (pageToFetch: number) => {
    setIsLoading(true);
    
    try {
      let query = supabase
        .from('schools')
        .select('*')
        .order('name');
      
      // Apply filters
      Object.entries(filter).forEach(([key, value]) => {
        if (value !== null && value !== undefined && value !== 'all') {
          query = query.eq(key, value);
        }
      });
      
      // Apply search term
      if (searchTerm) {
        query = query.ilike('name', `%${searchTerm}%`);
      }
      
      // Apply pagination
      const startIndex = (pageToFetch - 1) * limit;
      const endIndex = startIndex + limit;
      query = query.range(startIndex, endIndex - 1);
      
      const { data, error, count } = await query;

      if (error) throw error;
      
      if (pageToFetch === 1) {
        setSchools(data || []);
      } else {
        setSchools((prev) => [...prev, ...(data || [])]);
      }
      
      // Check if there are more schools to load
      if (data && count !== null) {
        setHasMore((startIndex + data.length) < count);
      } else {
        setHasMore(data && data.length === limit);
      }
    } catch (error) {
      console.error('Error fetching schools:', error);
      toast({
        title: "Error",
        description: "Failed to load schools. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleLoadMore = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    fetchSchools(nextPage);
  };

  if (isLoading && page === 1) {
    return <PageLoader isLoading={true} variant="cards" count={6} />;
  }

  if (schools.length === 0 && !isLoading) {
    return (
      <div className="text-center py-10">
        <h3 className="text-lg font-medium mb-2">No Schools Found</h3>
        <p className="text-muted-foreground mb-4">No schools match your current filters.</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {schools.map((school) => (
          <SchoolCard key={school.id} school={school} />
        ))}
      </div>
      
      {showLoadMore && hasMore && (
        <div className="flex justify-center mt-6">
          <Button 
            onClick={handleLoadMore} 
            variant="outline" 
            disabled={isLoading}
            className="min-w-[150px]"
          >
            {isLoading ? 'Loading...' : 'Load More'}
          </Button>
        </div>
      )}
    </div>
  );
}
