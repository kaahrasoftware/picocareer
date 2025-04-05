
import { BlogWithAuthor } from "@/types/blog/types";
import { BlogCard } from "./BlogCard";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { PageLoader } from "@/components/ui/page-loader";

interface BlogGridProps {
  blogs: BlogWithAuthor[];
  isLoading: boolean;
}

export function BlogGrid({ blogs, isLoading }: BlogGridProps) {
  if (isLoading) {
    return <PageLoader isLoading={true} variant="cards" count={6} />;
  }

  if (blogs.length === 0) {
    return (
      <div className="text-center py-12 bg-muted/50 rounded-lg">
        <h3 className="text-lg font-medium text-muted-foreground mb-2">
          No blog posts found
        </h3>
        <p className="text-sm text-muted-foreground">
          Try adjusting your filters or check back later
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {blogs.map((blog) => (
        <BlogCard key={blog.id} blog={blog} />
      ))}
    </div>
  );
}
