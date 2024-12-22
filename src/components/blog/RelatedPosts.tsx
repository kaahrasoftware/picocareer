import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { BlogWithAuthor } from "@/types/blog/types";
import { BlogCard } from "./BlogCard";

interface RelatedPostsProps {
  blog: BlogWithAuthor;
  isOpen: boolean;
}

export function RelatedPosts({ blog, isOpen }: RelatedPostsProps) {
  const { data: relatedPosts } = useQuery({
    queryKey: ['related-posts', blog.id, blog.categories, blog.subcategories],
    queryFn: async () => {
      try {
        // Ensure categories and subcategories are arrays and contain only valid strings
        const categories = (Array.isArray(blog.categories) ? blog.categories : [])
          .filter((category): category is string => 
            typeof category === 'string' && category.length > 0
          );
        
        const subcategories = (Array.isArray(blog.subcategories) ? blog.subcategories : [])
          .filter((subcategory): subcategory is string => 
            typeof subcategory === 'string' && subcategory.length > 0
          );

        // Build query conditions only for valid categories and subcategories
        const conditions: string[] = [];
        
        if (categories.length > 0) {
          conditions.push(`categories.cs.{${categories.join(',')}}`);
        }
        
        if (subcategories.length > 0) {
          conditions.push(`subcategories.cs.{${subcategories.join(',')}}`);
        }

        // Use a default condition if no valid categories or subcategories
        const queryCondition = conditions.length > 0 
          ? conditions.join(' OR ')
          : 'categories.cs.{}';

        console.log('Related posts query condition:', queryCondition);

        const { data, error } = await supabase
          .from('blogs')
          .select(`
            *,
            profiles (
              full_name,
              avatar_url
            )
          `)
          .neq('id', blog.id)
          .or(queryCondition)
          .limit(3);

        if (error) {
          console.error('Error fetching related posts:', error);
          throw error;
        }

        return data as BlogWithAuthor[];
      } catch (error) {
        console.error('Error in related posts query:', error);
        return [];
      }
    },
    enabled: isOpen && (
      (Array.isArray(blog.categories) && blog.categories.length > 0) || 
      (Array.isArray(blog.subcategories) && blog.subcategories.length > 0)
    ),
  });

  // Don't render anything if no related posts
  if (!relatedPosts || relatedPosts.length === 0) return null;

  return (
    <div className="mt-8">
      <h3 className="text-lg font-semibold mb-4">Related Posts</h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {relatedPosts.map((relatedPost) => (
          <BlogCard key={relatedPost.id} blog={relatedPost} />
        ))}
      </div>
    </div>
  );
}