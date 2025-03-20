
import { FileText, BookOpen, Calendar, Plus, Video, Image, File } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

interface ContentEmptyStateProps {
  contentType: string;
}

export function ContentEmptyState({ contentType }: ContentEmptyStateProps) {
  const navigate = useNavigate();

  const getEmptyStateDetails = () => {
    switch (contentType) {
      case "blogs":
        return {
          icon: <BookOpen className="h-12 w-12 text-muted-foreground/50" />,
          title: "No blogs found",
          description: "You haven't published any blogs yet.",
          actionText: "Create Blog",
          actionPath: "/blog-upload"
        };
      case "hub_resources":
        return {
          icon: <FileText className="h-12 w-12 text-muted-foreground/50" />,
          title: "No hub resources found",
          description: "You haven't shared any hub resources yet.",
          actionText: "Upload Resource",
          actionPath: "/hub"
        };
      case "mentor_resources":
        return {
          icon: <File className="h-12 w-12 text-muted-foreground/50" />,
          title: "No posts found",
          description: "You haven't created any posts yet.",
          actionText: "Create Post",
          actionPath: "/feed-upload"
        };
      default:
        return {
          icon: <Calendar className="h-12 w-12 text-muted-foreground/50" />,
          title: "No content found",
          description: "You haven't created any content yet.",
          actionText: "Create Content",
          actionPath: "/feed-upload"
        };
    }
  };

  const { icon, title, description, actionText, actionPath } = getEmptyStateDetails();

  return (
    <div className="text-center py-12 space-y-4 bg-muted/20 rounded-lg border border-dashed">
      <div className="mx-auto flex justify-center">{icon}</div>
      <div className="space-y-2">
        <h3 className="text-lg font-medium">{title}</h3>
        <p className="text-muted-foreground">{description}</p>
      </div>
      <Button onClick={() => navigate(actionPath)}>
        <Plus className="h-4 w-4 mr-2" />
        {actionText}
      </Button>
    </div>
  );
}
