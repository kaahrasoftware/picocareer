
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { 
  File, 
  FileImage, 
  FileSpreadsheet, 
  FileText, 
  Link as LinkIcon, 
  MoreVertical, 
  Pencil, 
  Trash2, 
  ExternalLink,
  FilePresentation
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { formatFileSize } from "@/utils/storageUtils";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { useState } from "react";
import { EditContentDialog } from "./EditContentDialog";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface ContentItem {
  id: string;
  title: string;
  description: string | null;
  content_type: string;
  file_url: string | null;
  external_url: string | null;
  size_in_bytes: number;
  status: string;
  created_at: string;
  metadata: Record<string, any>;
}

interface MentorContentListProps {
  contentItems: ContentItem[];
  isLoading: boolean;
  isOwner: boolean;
  onRefresh: () => void;
}

export function MentorContentList({ contentItems, isLoading, isOwner, onRefresh }: MentorContentListProps) {
  const [editingItem, setEditingItem] = useState<ContentItem | null>(null);
  const { toast } = useToast();

  const getContentIcon = (contentType: string) => {
    switch (contentType) {
      case 'pdf':
        return <File className="h-6 w-6 text-red-500" />;
      case 'presentation':
        return <FilePresentation className="h-6 w-6 text-orange-500" />;
      case 'document':
        return <FileText className="h-6 w-6 text-blue-500" />;
      case 'spreadsheet':
        return <FileSpreadsheet className="h-6 w-6 text-green-500" />;
      case 'image':
        return <FileImage className="h-6 w-6 text-purple-500" />;
      case 'blog':
        return <FileText className="h-6 w-6 text-teal-500" />;
      case 'link':
        return <LinkIcon className="h-6 w-6 text-sky-500" />;
      default:
        return <File className="h-6 w-6 text-gray-500" />;
    }
  };

  const handleDelete = async (item: ContentItem) => {
    try {
      // Delete the content record
      const { error } = await supabase
        .from('mentor_content')
        .delete()
        .eq('id', item.id);

      if (error) throw error;

      // Delete the file from storage if it exists
      if (item.file_url) {
        const filePathMatch = item.file_url.match(/mentor-content\/(.+)$/);
        if (filePathMatch && filePathMatch[1]) {
          const { error: storageError } = await supabase.storage
            .from('mentor-content')
            .remove([filePathMatch[1]]);
          
          if (storageError) {
            console.error("Error deleting file:", storageError);
          }
        }
      }

      toast({
        title: "Content deleted",
        description: "The content has been successfully deleted.",
      });
      
      onRefresh();
    } catch (error) {
      console.error("Error deleting content:", error);
      toast({
        title: "Error",
        description: "Failed to delete the content. Please try again.",
        variant: "destructive",
      });
    }
  };

  const renderContentList = () => {
    if (isLoading) {
      return Array.from({ length: 3 }).map((_, index) => (
        <Card key={index} className="overflow-hidden">
          <CardHeader className="p-4 pb-2">
            <Skeleton className="h-5 w-full max-w-[200px]" />
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <Skeleton className="h-4 w-full mb-2" />
            <Skeleton className="h-4 w-3/4" />
          </CardContent>
          <CardFooter className="p-4 pt-0 flex justify-between">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-4 w-24" />
          </CardFooter>
        </Card>
      ));
    }

    if (contentItems.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center py-8 text-center">
          <File className="h-12 w-12 text-muted-foreground mb-4" />
          <p className="text-muted-foreground">No content available</p>
        </div>
      );
    }

    return contentItems.map(item => (
      <Card key={item.id} className="overflow-hidden group">
        <CardHeader className="p-4 pb-2 flex flex-row items-start justify-between">
          <div className="flex items-center gap-2">
            {getContentIcon(item.content_type)}
            <h3 className="font-medium truncate">{item.title}</h3>
          </div>
          {isOwner && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => setEditingItem(item)}>
                  <Pencil className="h-4 w-4 mr-2" /> Edit
                </DropdownMenuItem>
                <DropdownMenuItem 
                  className="text-destructive focus:text-destructive"
                  onClick={() => handleDelete(item)}
                >
                  <Trash2 className="h-4 w-4 mr-2" /> Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </CardHeader>
        <CardContent className="p-4 pt-0">
          {item.description && (
            <p className="text-sm text-muted-foreground line-clamp-2 mb-2">{item.description}</p>
          )}
        </CardContent>
        <CardFooter className="p-4 pt-0 flex justify-between items-center">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <span>{formatDistanceToNow(new Date(item.created_at), { addSuffix: true })}</span>
            {item.size_in_bytes > 0 && (
              <span className="px-2 py-0.5 bg-muted rounded-full">
                {formatFileSize(item.size_in_bytes)}
              </span>
            )}
            <Badge variant="outline" className="text-xs font-normal">
              {item.content_type.charAt(0).toUpperCase() + item.content_type.slice(1)}
            </Badge>
            {isOwner && item.status !== 'published' && (
              <Badge variant={item.status === 'draft' ? 'secondary' : 'outline'} className="text-xs font-normal">
                {item.status}
              </Badge>
            )}
          </div>
          
          {(item.file_url || item.external_url) && (
            <Button 
              variant="ghost" 
              size="sm" 
              className="h-8 p-0 px-2"
              asChild
            >
              <a 
                href={item.file_url || item.external_url || '#'} 
                target="_blank" 
                rel="noopener noreferrer"
              >
                <ExternalLink className="h-4 w-4 mr-1" /> Open
              </a>
            </Button>
          )}
        </CardFooter>
      </Card>
    ));
  };

  return (
    <div className="space-y-4">
      {renderContentList()}
      {editingItem && (
        <EditContentDialog
          open={!!editingItem}
          onOpenChange={() => setEditingItem(null)}
          contentItem={editingItem}
          onContentUpdated={() => {
            onRefresh();
            setEditingItem(null);
          }}
        />
      )}
    </div>
  );
}
