import { BlogWithAuthor } from "@/types/blog/types";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { format } from "date-fns";

interface BlogPostContentProps {
  blog: BlogWithAuthor;
}

export function BlogPostContent({ blog }: BlogPostContentProps) {
  return (
    <div className="space-y-6">
      <div className="relative h-64 w-full flex justify-center items-center overflow-hidden">
        <img
          src={blog.cover_image_url || `https://picsum.photos/seed/${blog.id}/1200/600`}
          alt={blog.title}
          className="w-full h-full object-cover rounded-xl"
        />
      </div>

      <div className="text-center space-y-4">
        <h1 className="text-2xl font-bold">{blog.title}</h1>
        
        <div className="flex flex-wrap gap-1.5 justify-center">
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
      </div>

      <div className="flex items-center gap-2">
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

      <div className="prose prose-sm dark:prose-invert max-w-none">
        <p className="text-muted-foreground mb-4">{blog.summary}</p>
        <div 
          dangerouslySetInnerHTML={{ __html: blog.content }} 
          className="prose-headings:font-semibold prose-h2:text-xl prose-h2:mt-6 prose-h2:mb-4 
                     prose-p:my-3 prose-ul:my-4 prose-li:my-1"
        />
      </div>
    </div>
  );
}