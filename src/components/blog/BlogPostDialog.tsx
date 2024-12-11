import { Dialog, DialogContent } from "@/components/ui/dialog";
import { BlogWithAuthor } from "@/types/blog/types";
import { BlogPostHeader } from "./BlogPostHeader";
import { BlogPostContent } from "./BlogPostContent";
import { RelatedPosts } from "./RelatedPosts";

interface BlogPostDialogProps {
  blog: BlogWithAuthor;
  isOpen: boolean;
  onClose: () => void;
}

export function BlogPostDialog({ blog, isOpen, onClose }: BlogPostDialogProps) {
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <BlogPostHeader blog={blog} />
        <BlogPostContent blog={blog} />
        <RelatedPosts blog={blog} />
      </DialogContent>
    </Dialog>
  );
}