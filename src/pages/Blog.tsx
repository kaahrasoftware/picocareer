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

const ITEMS_PER_PAGE = 6;

const Blog = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("_all");
  const [selectedSubcategory, setSelectedSubcategory] = useState<string>("_all");
  const [showRecentOnly, setShowRecentOnly] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  const { data: blogs, isLoading } = useQuery({
    queryKey: ['blogs', searchQuery, selectedCategory, selectedSubcategory, showRecentOnly],
    queryFn: async () => {
      let query = supabase
        .from('blogs')
        .select(`
          *,
          profiles (
            full_name,
            avatar_url
          )
        `);

      if (selectedCategory && selectedCategory !== "_all") {
        query = query.eq('category', selectedCategory);
      }

      if (selectedSubcategory && selectedSubcategory !== "_all") {
        query = query.eq('subcategory', selectedSubcategory);
      }

      if (showRecentOnly) {
        query = query.eq('is_recent', true);
      }

      if (searchQuery) {
        query = query.ilike('title', `%${searchQuery}%`);
      }

      const { data, error } = await query;

      if (error) throw error;
      return data as BlogWithAuthor[];
    },
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

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background text-foreground">
        <MenuSidebar />
        <main className="flex-1 p-8">
          <div className="max-w-[1400px] mx-auto">
            <BlogHeader />

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

            <BlogGrid blogs={currentItems} isLoading={isLoading} />

            {!isLoading && blogs && blogs.length > 0 && (
              <BlogPagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={handlePageChange}
              />
            )}
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
};

export default Blog;