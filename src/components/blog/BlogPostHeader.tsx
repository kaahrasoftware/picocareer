import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { BlogWithAuthor } from "@/types/blog/types";
import { format } from "date-fns";

interface BlogPostHeaderProps {
  blog: BlogWithAuthor;
}

export function BlogPostHeader({ blog }: BlogPostHeaderProps) {
  return (
    <DialogHeader className="text-center">
      <DialogTitle className="text-2xl font-bold mb-4">{blog.title}</DialogTitle>
      <div className="flex items-center justify-center gap-2 mt-2">
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
  );
}