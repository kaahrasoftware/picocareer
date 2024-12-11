import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { BlogWithAuthor } from "@/types/blog/types";
import { useState } from "react";
import { BlogPostDialog } from "./BlogPostDialog";

interface BlogCardProps {
  blog: BlogWithAuthor;
}

export function BlogCard({ blog }: BlogCardProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  // Generate a deterministic cover image URL based on the blog's ID
  const coverImageUrl = `https://picsum.photos/seed/${blog.id}/800/400`;

  return (
    <>
      <Card 
        key={blog.id} 
        className="overflow-hidden cursor-pointer hover:shadow-lg transition-shadow"
        onClick={() => setIsDialogOpen(true)}
      >
        <div className="relative h-48 w-full">
          <img
            src={coverImageUrl}
            alt={blog.title}
            className="absolute inset-0 w-full h-full object-cover"
          />
        </div>
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
          <div className="flex flex-wrap gap-2 mt-4">
            {blog.categories?.map((category) => (
              <span key={category} className="text-xs px-2 py-1 bg-primary/10 rounded-full">
                {category}
              </span>
            ))}
            {blog.subcategories?.map((subcategory) => (
              <span key={subcategory} className="text-xs px-2 py-1 bg-primary/10 rounded-full">
                {subcategory}
              </span>
            ))}
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

      <BlogPostDialog 
        blog={blog} 
        isOpen={isDialogOpen} 
        onClose={() => setIsDialogOpen(false)} 
      />
    </>
  );
}