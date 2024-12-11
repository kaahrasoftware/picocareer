import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { BlogWithAuthor } from "@/types/blog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { format } from "date-fns";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { BlogCard } from "./BlogCard";

interface BlogPostDialogProps {
  blog: BlogWithAuthor;
  isOpen: boolean;
  onClose: () => void;
}

export function BlogPostDialog({ blog, isOpen, onClose }: BlogPostDialogProps) {
  // Query for related posts based on category and subcategory
  const { data: relatedPosts } = useQuery({
    queryKey: ['related-posts', blog.id, blog.category, blog.subcategory],
    queryFn: async () => {
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
        .or(`category.eq.${blog.category},subcategory.eq.${blog.subcategory}`)
        .limit(3);

      if (error) throw error;
      return data as BlogWithAuthor[];
    },
    enabled: isOpen, // Only fetch when dialog is open
  });

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">{blog.title}</DialogTitle>
          <div className="flex items-center gap-2 mt-2">
            <Avatar className="h-8 w-8">
              <AvatarImage src={blog.profiles?.avatar_url || ''} />
              <AvatarFallback>
                {blog.profiles?.full_name?.charAt(0) || 'A'}
              </AvatarFallback>
            </Avatar>
            <div className="flex flex-col">
              <span className="text-sm font-medium">
                {blog.profiles?.full_name || 'Anonymous'}
              </span>
              <span className="text-xs text-muted-foreground">
                {format(new Date(blog.created_at), 'MMMM d, yyyy')}
              </span>
            </div>
          </div>
        </DialogHeader>

        {blog.cover_image_url && (
          <div className="relative h-64 w-full -mx-6">
            <img
              src={blog.cover_image_url}
              alt={blog.title}
              className="absolute inset-0 w-full h-full object-cover"
            />
          </div>
        )}

        <div className="prose prose-sm dark:prose-invert max-w-none mt-4">
          <p className="text-muted-foreground mb-4">{blog.summary}</p>
          <div dangerouslySetInnerHTML={{ __html: blog.content }} />
        </div>

        {blog.category && blog.subcategory && (
          <div className="flex gap-2 mt-4">
            <span className="text-xs px-2 py-1 bg-primary/10 rounded-full">
              {blog.category}
            </span>
            <span className="text-xs px-2 py-1 bg-primary/10 rounded-full">
              {blog.subcategory}
            </span>
          </div>
        )}

        {relatedPosts && relatedPosts.length > 0 && (
          <div className="mt-8">
            <h3 className="text-lg font-semibold mb-4">Related Posts</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {relatedPosts.map((relatedPost) => (
                <BlogCard key={relatedPost.id} blog={relatedPost} />
              ))}
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}