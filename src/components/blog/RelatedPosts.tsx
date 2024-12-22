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
      // Create the query conditions for categories and subcategories
      const categoryConditions = blog.categories?.map(category => 
        `categories.cs.{${category}}`
      ) || [];
      
      const subcategoryConditions = blog.subcategories?.map(subcategory => 
        `subcategories.cs.{${subcategory}}`
      ) || [];

      // Combine conditions, ensuring we have at least one condition
      const conditions = [...categoryConditions, ...subcategoryConditions];
      const queryCondition = conditions.length > 0 ? conditions.join(',') : 'categories.cs.{}';

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

      if (error) throw error;
      return data as BlogWithAuthor[];
    },
    enabled: isOpen && (
      (blog.categories?.length ?? 0) > 0 || 
      (blog.subcategories?.length ?? 0) > 0
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