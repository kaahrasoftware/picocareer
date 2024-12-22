import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { BlogWithAuthor } from "@/types/blog/types";
import { useState } from "react";
import { BlogPostDialog } from "./BlogPostDialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { format } from "date-fns";

interface BlogCardProps {
  blog: BlogWithAuthor;
}

export function BlogCard({ blog }: BlogCardProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  return (
    <>
      <Card 
        key={blog.id} 
        className="group overflow-hidden cursor-pointer hover:shadow-lg transition-all duration-300 border border-border/50"
        onClick={() => setIsDialogOpen(true)}
      >
        <div className="relative h-48 w-full overflow-hidden">
          <img
            src={blog.cover_image_url || `https://picsum.photos/seed/${blog.id}/800/400`}
            alt={blog.title}
            className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
          {blog.is_recent && (
            <span className="absolute top-2 right-2 text-xs px-2 py-1 bg-green-500 text-white rounded-full font-medium">
              New
            </span>
          )}
        </div>

        <CardHeader className="space-y-2">
          <div className="flex items-center gap-2">
            <Avatar className="h-8 w-8">
              <AvatarImage src={blog.profiles?.avatar_url || ''} />
              <AvatarFallback>{blog.profiles?.full_name?.[0] || 'A'}</AvatarFallback>
            </Avatar>
            <div className="flex flex-col">
              <span className="text-sm font-medium">
                {blog.profiles?.full_name || 'Anonymous'}
              </span>
              <span className="text-xs text-muted-foreground">
                {format(new Date(blog.created_at), 'MMM d, yyyy')}
              </span>
            </div>
          </div>
          <CardTitle className="line-clamp-2 hover:text-primary transition-colors">
            {blog.title}
          </CardTitle>
          <CardDescription className="line-clamp-2">
            {blog.summary}
          </CardDescription>
        </CardHeader>

        <CardContent>
          <div className="flex flex-wrap gap-1.5">
            {blog.categories?.map((category) => (
              <span 
                key={category} 
                className="text-[10px] px-2 py-1 bg-[#9b87f5] text-white rounded-full font-medium"
              >
                {category}
              </span>
            ))}
            {blog.subcategories?.map((subcategory) => (
              <span 
                key={subcategory} 
                className="text-[10px] px-2 py-1 bg-[#7E69AB]/20 text-[#7E69AB] rounded-full font-medium"
              >
                {subcategory}
              </span>
            ))}
          </div>
        </CardContent>

        <CardFooter className="flex justify-between items-center text-xs text-muted-foreground">
          <span>
            Last updated: {format(new Date(blog.updated_at), 'MMM d, yyyy')}
          </span>
          <span className="hover:text-primary transition-colors">
            Read more →
          </span>
        </CardFooter>
      </Card>

      <BlogPostDialog 
        blog={blog} 
        isOpen={isDialogOpen} 
        onClose={() => setIsDialogOpen(false)} 
      />
    </>
  );
}