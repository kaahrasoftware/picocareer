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
        // Ensure categories and subcategories are arrays, even if empty
        const categories = Array.isArray(blog.categories) ? blog.categories : [];
        const subcategories = Array.isArray(blog.subcategories) ? blog.subcategories : [];

        // Only create conditions for non-empty values
        const categoryConditions = categories
          .filter(category => category && typeof category === 'string')
          .map(category => `categories.cs.{${category}}`);
        
        const subcategoryConditions = subcategories
          .filter(subcategory => subcategory && typeof subcategory === 'string')
          .map(subcategory => `subcategories.cs.{${subcategory}}`);

        // Combine conditions, ensuring we have at least one condition
        const conditions = [...categoryConditions, ...subcategoryConditions];
        const queryCondition = conditions.length > 0 ? conditions.join(',') : 'categories.cs.{}';

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
      Array.isArray(blog.categories) && blog.categories.length > 0 || 
      Array.isArray(blog.subcategories) && blog.subcategories.length > 0
    ),
  });

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