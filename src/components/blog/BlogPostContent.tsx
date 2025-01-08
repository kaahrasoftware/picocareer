import { BlogWithAuthor } from "@/types/blog/types";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { format } from "date-fns";
import { Facebook, Linkedin, Share2, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface BlogPostContentProps {
  blog: BlogWithAuthor;
}

export function BlogPostContent({ blog }: BlogPostContentProps) {
  const shareUrl = window.location.href;
  const title = encodeURIComponent(blog.title);
  const summary = encodeURIComponent(blog.summary);

  const shareLinks = {
    whatsapp: `https://wa.me/?text=${title}%20${shareUrl}`,
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${shareUrl}`,
    linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${shareUrl}&title=${title}&summary=${summary}`,
  };

  const handleShare = async () => {
    try {
      await navigator.share({
        title: blog.title,
        text: blog.summary,
        url: shareUrl,
      });
      toast.success("Successfully shared!");
    } catch (error) {
      if (error instanceof Error && error.name !== "AbortError") {
        toast.error("Failed to share");
      }
    }
  };

  const openShareWindow = (url: string) => {
    window.open(url, '_blank', 'width=600,height=400');
  };

  return (
    <div className="space-y-6">
      <div className="relative h-64 w-full flex items-center justify-center overflow-hidden">
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

      {/* Share buttons */}
      <div className="flex items-center gap-2 justify-center">
        <Button
          variant="outline"
          size="icon"
          onClick={() => openShareWindow(shareLinks.whatsapp)}
          className="hover:text-green-500"
        >
          <MessageCircle className="h-4 w-4" />
        </Button>
        <Button
          variant="outline"
          size="icon"
          onClick={() => openShareWindow(shareLinks.facebook)}
          className="hover:text-blue-600"
        >
          <Facebook className="h-4 w-4" />
        </Button>
        <Button
          variant="outline"
          size="icon"
          onClick={() => openShareWindow(shareLinks.linkedin)}
          className="hover:text-blue-700"
        >
          <Linkedin className="h-4 w-4" />
        </Button>
        <Button
          variant="outline"
          size="icon"
          onClick={handleShare}
          className="hover:text-primary"
        >
          <Share2 className="h-4 w-4" />
        </Button>
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