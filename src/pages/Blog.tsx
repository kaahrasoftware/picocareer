import { SidebarProvider } from "@/components/ui/sidebar";
import { MenuSidebar } from "@/components/MenuSidebar";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { BlogWithAuthor } from "@/types/blog/types";
import { useState } from "react";
import { BlogFilters } from "@/components/blog/BlogFilters";
import { BlogPagination } from "@/components/blog/BlogPagination";
import { BlogGrid } from "@/components/blog/BlogGrid";
import { BlogHeader } from "@/components/blog/BlogHeader";
import { toast } from "sonner";
import { Database } from "@/integrations/supabase/types";

type Categories = Database["public"]["Enums"]["categories"];

const ITEMS_PER_PAGE = 6;

const Blog = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<Categories | "_all">("_all");
  const [selectedSubcategory, setSelectedSubcategory] = useState<string>("_all");
  const [showRecentOnly, setShowRecentOnly] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  const { data: blogs, isLoading, error } = useQuery({
    queryKey: ['blogs', searchQuery, selectedCategory, selectedSubcategory, showRecentOnly],
    queryFn: async () => {
      try {
        console.log('Fetching blogs with query:', { searchQuery, selectedCategory, selectedSubcategory, showRecentOnly });
        
        let query = supabase
          .from('blogs')
          .select(`
            *,
            profiles (
              full_name,
              avatar_url
            )
          `)
          .eq('status', 'Approved'); // Only fetch approved blogs

        // Search across multiple columns
        if (searchQuery) {
          query = query.or(
            `title.ilike.%${searchQuery}%,` +
            `summary.ilike.%${searchQuery}%,` +
            `content.ilike.%${searchQuery}%,` +
            `profiles.full_name.ilike.%${searchQuery}%`
          );
        }

        if (selectedCategory && selectedCategory !== "_all") {
          query = query.contains('categories', [selectedCategory]);
        }

        if (selectedSubcategory && selectedSubcategory !== "_all") {
          query = query.contains('subcategories', [selectedSubcategory]);
        }

        if (showRecentOnly) {
          query = query.eq('is_recent', true);
        }

        const { data, error } = await query;

        if (error) {
          console.error('Supabase query error:', error);
          throw error;
        }

        console.log('Fetched blogs:', data);
        return data as BlogWithAuthor[];
      } catch (error) {
        console.error('Error fetching blogs:', error);
        toast.error('Failed to fetch blogs. Please try again.');
        throw error;
      }
    },
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });

  // Calculate pagination values
  const totalItems = blogs?.length || 0;
  const totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const currentItems = blogs?.slice(startIndex, endIndex) || [];

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (error) {
    console.error('Query error:', error);
  }

  return (
    <SidebarProvider>
      <div className="app-layout">
        <MenuSidebar />
        <div className="main-content">
          <div className="px-4 md:px-8 py-8 max-w-7xl mx-auto w-full">
            <div className="space-y-8">
              {/* Make the header and filters sticky with a compact design */}
              <div className="sticky top-0 z-10 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 transition-all duration-200 pb-4">
                <div className="transform transition-transform duration-200 py-2">
                  <BlogHeader />
                </div>
                
                <div className="transform transition-all duration-200 -mx-2">
                  <BlogFilters
                    searchQuery={searchQuery}
                    setSearchQuery={setSearchQuery}
                    selectedCategory={selectedCategory}
                    setSelectedCategory={setSelectedCategory}
                    selectedSubcategory={selectedSubcategory}
                    setSelectedSubcategory={setSelectedSubcategory}
                    showRecentOnly={showRecentOnly}
                    setShowRecentOnly={setShowRecentOnly}
                  />
                </div>
              </div>

              <BlogGrid blogs={currentItems} isLoading={isLoading} />
              {!isLoading && blogs && blogs.length > 0 && (
                <BlogPagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={handlePageChange}
                />
              )}
            </div>
          </div>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default Blog;