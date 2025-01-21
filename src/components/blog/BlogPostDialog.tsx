import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { BlogPostContent } from "./BlogPostContent";
import { BlogPostHeader } from "./BlogPostHeader";
import { RelatedPosts } from "./RelatedPosts";
import type { Blog } from "@/types/blog/types";

interface BlogPostDialogProps {
  blog: Blog | null;
  isOpen: boolean;
  onClose: () => void;
}

export function BlogPostDialog({ blog, isOpen, onClose }: BlogPostDialogProps) {
  if (!blog) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/95">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">
            {blog.title}
          </DialogTitle>
        </DialogHeader>
        
        <BlogPostHeader blog={blog} />
        <BlogPostContent content={blog.content} />
        <RelatedPosts currentBlogId={blog.id} />
      </DialogContent>
    </Dialog>
  );
}