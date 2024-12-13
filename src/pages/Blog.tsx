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
import { useNavigate } from "react-router-dom";

const ITEMS_PER_PAGE = 6;

const Blog = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("_all");
  const [selectedSubcategory, setSelectedSubcategory] = useState<string>("_all");
  const [showRecentOnly, setShowRecentOnly] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const navigate = useNavigate();

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
        </main>
      </div>
    </SidebarProvider>
  );
};

export default Blog;