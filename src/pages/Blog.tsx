import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { BookOpen } from "lucide-react";

interface Blog {
  id: string;
  title: string;
  summary: string;
  content: string;
  author_id: string;
  cover_image_url: string | null;
  category: string | null;
  subcategory: string | null;
  is_recent: boolean;
  created_at: string;
  profiles: {
    full_name: string | null;
    avatar_url: string | null;
  };
}

const Blog = () => {
  const [selectedBlog, setSelectedBlog] = useState<Blog | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [selectedSubcategory, setSelectedSubcategory] = useState<string>("");
  const [showRecentOnly, setShowRecentOnly] = useState(false);

  const { data: blogs = [], isLoading } = useQuery({
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

      if (searchQuery) {
        query = query.or(`title.ilike.%${searchQuery}%,summary.ilike.%${searchQuery}%`);
      }

      if (selectedCategory) {
        query = query.eq('category', selectedCategory);
      }

      if (selectedSubcategory) {
        query = query.eq('subcategory', selectedSubcategory);
      }

      if (showRecentOnly) {
        query = query.eq('is_recent', true);
      }

      query = query.order('created_at', { ascending: false });

      const { data, error } = await query;

      if (error) throw error;
      return data as Blog[];
    },
  });

  const categories = ['Career Development', 'Education', 'Technology', 'Personal Growth', 'Professional Skills'];
  const subcategories = ['Interview Tips', 'Study Techniques', 'Programming', 'Leadership', 'Time Management'];

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="container mx-auto py-8">
      <div className="flex items-center gap-2 mb-8">
        <BookOpen className="w-6 h-6" />
        <h1 className="text-3xl font-bold">Blog Posts</h1>
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
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All Categories</SelectItem>
              {categories.map((category) => (
                <SelectItem key={category} value={category}>
                  {category}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={selectedSubcategory} onValueChange={setSelectedSubcategory}>
            <SelectTrigger className="w-full md:w-[200px]">
              <SelectValue placeholder="Subcategory" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All Subcategories</SelectItem>
              {subcategories.map((subcategory) => (
                <SelectItem key={subcategory} value={subcategory}>
                  {subcategory}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <div className="flex items-center gap-2">
            <Switch
              id="recent"
              checked={showRecentOnly}
              onCheckedChange={setShowRecentOnly}
            />
            <Label htmlFor="recent">Recent posts only</Label>
          </div>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {blogs.map((blog) => (
          <Card key={blog.id} className="flex flex-col overflow-hidden">
            {blog.cover_image_url && (
              <div className="relative h-48 overflow-hidden">
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
                By {blog.profiles.full_name || 'Anonymous'} • {new Date(blog.created_at).toLocaleDateString()}
              </CardDescription>
              {blog.category && (
                <div className="flex gap-2 mt-2">
                  <span className="text-sm px-2 py-1 bg-primary/10 rounded-full">
                    {blog.category}
                  </span>
                  {blog.subcategory && (
                    <span className="text-sm px-2 py-1 bg-primary/10 rounded-full">
                      {blog.subcategory}
                    </span>
                  )}
                </div>
              )}
            </CardHeader>
            <CardContent className="flex-1">
              <p className="text-muted-foreground">{blog.summary}</p>
            </CardContent>
            <CardFooter>
              <Button variant="outline" className="w-full" onClick={() => setSelectedBlog(blog)}>
                Read More
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default Blog;