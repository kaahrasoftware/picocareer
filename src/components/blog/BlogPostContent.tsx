import { BlogWithAuthor } from "@/types/blog/types";

interface BlogPostContentProps {
  blog: BlogWithAuthor;
}

export function BlogPostContent({ blog }: BlogPostContentProps) {
  return (
    <>
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
    </>
  );
}