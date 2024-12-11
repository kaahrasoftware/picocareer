import { SidebarProvider } from "@/components/ui/sidebar";
import { MenuSidebar } from "@/components/MenuSidebar";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useState } from "react";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { BlogWithAuthor } from "@/types/blog";

const Blog = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("_all");
  const [selectedSubcategory, setSelectedSubcategory] = useState<string>("_all");
  const [showRecentOnly, setShowRecentOnly] = useState(false);

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

  const categories = ["Technology", "Career", "Education"];
  const subcategories = {
    Technology: ["Programming", "Data Science", "Web Development"],
    Career: ["Job Search", "Interview Tips", "Career Change"],
    Education: ["Study Tips", "College Life", "Graduate School"],
  };

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background text-foreground">
        <MenuSidebar />
        <main className="flex-1 p-8">
          <div className="max-w-[1400px] mx-auto">
            <div className="flex justify-between items-center mb-8">
              <h1 className="text-3xl font-bold">Blog Posts</h1>
              <ThemeToggle />
            </div>

            <div className="grid gap-6 mb-8">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1">
                  <Input
                    placeholder="Search blogs..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full"
                  />
                </div>
                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                  <SelectTrigger className="w-full md:w-[200px]">
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="_all">All Categories</SelectItem>
                    {categories.map((category) => (
                      <SelectItem key={category} value={category}>
                        {category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select 
                  value={selectedSubcategory} 
                  onValueChange={setSelectedSubcategory}
                  disabled={!selectedCategory || selectedCategory === "_all"}
                >
                  <SelectTrigger className="w-full md:w-[200px]">
                    <SelectValue placeholder="Select subcategory" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="_all">All Subcategories</SelectItem>
                    {selectedCategory && selectedCategory !== "_all" && 
                      subcategories[selectedCategory as keyof typeof subcategories].map((subcategory) => (
                        <SelectItem key={subcategory} value={subcategory}>
                          {subcategory}
                        </SelectItem>
                      ))
                    }
                  </SelectContent>
                </Select>
                <div className="flex items-center space-x-2">
                  <Switch
                    id="recent-posts"
                    checked={showRecentOnly}
                    onCheckedChange={setShowRecentOnly}
                  />
                  <Label htmlFor="recent-posts">Recent posts only</Label>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {isLoading ? (
                Array(6).fill(0).map((_, i) => (
                  <Card key={i} className="overflow-hidden">
                    <Skeleton className="h-48 w-full" />
                    <CardHeader>
                      <Skeleton className="h-4 w-3/4" />
                      <Skeleton className="h-4 w-1/2" />
                    </CardHeader>
                    <CardContent>
                      <Skeleton className="h-24 w-full" />
                    </CardContent>
                  </Card>
                ))
              ) : blogs?.map((blog) => (
                <Card key={blog.id} className="overflow-hidden">
                  {blog.cover_image_url && (
                    <div className="relative h-48 w-full">
                      <img
                        src={blog.cover_image_url}
                        alt={blog.title}
                        className="absolute inset-0 w-full h-full object-cover"
                      />
                    </div>
                  )}
                  <CardHeader>
                    <CardTitle>{blog.title}</CardTitle>
                    <CardDescription>
                      By {blog.profiles?.full_name || 'Anonymous'}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground line-clamp-3">
                      {blog.summary}
                    </p>
                    <div className="flex gap-2 mt-4">
                      {blog.category && (
                        <span className="text-xs px-2 py-1 bg-primary/10 rounded-full">
                          {blog.category}
                        </span>
                      )}
                      {blog.subcategory && (
                        <span className="text-xs px-2 py-1 bg-primary/10 rounded-full">
                          {blog.subcategory}
                        </span>
                      )}
                    </div>
                  </CardContent>
                  <CardFooter className="flex justify-between items-center">
                    <p className="text-xs text-muted-foreground">
                      {new Date(blog.created_at).toLocaleDateString()}
                    </p>
                    {blog.is_recent && (
                      <span className="text-xs px-2 py-1 bg-green-500/10 text-green-500 rounded-full">
                        New
                      </span>
                    )}
                  </CardFooter>
                </Card>
              ))}
            </div>
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
};

export default Blog;