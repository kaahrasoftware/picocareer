
import { Download, Eye, FileText, Film, Image, Link, Music, Presentation, MoreHorizontal, Loader2 } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { EventResource } from "@/types/event-resources";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";

interface EventResourceCardProps {
  resource: EventResource;
  onView?: (resource: EventResource) => void;
  onDownload?: (resource: EventResource) => void;
  onEdit?: (resource: EventResource) => void;
  onDelete?: (resource: EventResource) => void;
  onPreview?: (resource: EventResource) => void;
  showActions?: boolean;
}

const getResourceIcon = (type: EventResource['resource_type']) => {
  const iconClass = "h-5 w-5";
  switch (type) {
    case 'video':
      return <Film className={iconClass} />;
    case 'audio':
      return <Music className={iconClass} />;
    case 'document':
      return <FileText className={iconClass} />;
    case 'presentation':
      return <Presentation className={iconClass} />;
    case 'image':
      return <Image className={iconClass} />;
    case 'link':
      return <Link className={iconClass} />;
    default:
      return <FileText className={iconClass} />;
  }
};

const getResourceTypeColor = (type: EventResource['resource_type']) => {
  switch (type) {
    case 'video':
      return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300';
    case 'audio':
      return 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300';
    case 'document':
      return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300';
    case 'presentation':
      return 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300';
    case 'image':
      return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300';
    case 'link':
      return 'bg-cyan-100 text-cyan-800 dark:bg-cyan-900/30 dark:text-cyan-300';
    default:
      return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300';
  }
};

const formatFileSize = (bytes?: number) => {
  if (!bytes) return null;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
};

export function EventResourceCard({ 
  resource, 
  onView, 
  onDownload,
  onEdit,
  onDelete, 
  onPreview,
  showActions = false 
}: EventResourceCardProps) {
  const [downloading, setDownloading] = useState(false);
  const { toast } = useToast();

  const handleView = (event: React.MouseEvent<HTMLButtonElement>) => {
    if (onPreview) {
      event.preventDefault();
      onPreview(resource);
    } else if (resource.external_url) {
      window.open(resource.external_url, '_blank', 'noopener,noreferrer');
    } else if (resource.file_url) {
      window.open(resource.file_url, '_blank', 'noopener,noreferrer');
    }
  };

  const handleDownload = async () => {
    if (!resource.file_url || !resource.is_downloadable) {
      toast({
        title: "Download not available",
        description: "This resource cannot be downloaded.",
        variant: "destructive"
      });
      return;
    }

    try {
      setDownloading(true);
      
      // Track download event
      console.log('Download started for resource:', resource.id);
      
      // Create a filename from the resource title and format
      const fileExtension = resource.file_format ? `.${resource.file_format.toLowerCase()}` : '';
      const fileName = `${resource.title}${fileExtension}`;
      
      // Try to fetch the file as blob first for better download handling
      try {
        const response = await fetch(resource.file_url);
        
        if (!response.ok) {
          throw new Error('Failed to fetch file');
        }
        
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        
        const link = document.createElement('a');
        link.href = url;
        link.download = fileName;
        link.style.display = 'none';
        
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        // Clean up the blob URL
        window.URL.revokeObjectURL(url);
        
        toast({
          title: "Download started",
          description: `${resource.title} is being downloaded.`
        });
        
      } catch (fetchError) {
        // Fallback to simple link download if blob fetch fails (e.g., CORS issues)
        console.log('Blob download failed, using fallback method:', fetchError);
        
        const link = document.createElement('a');
        link.href = resource.file_url;
        link.download = fileName;
        link.target = '_blank';
        link.rel = 'noopener noreferrer';
        
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        toast({
          title: "Download started",
          description: `${resource.title} download has been initiated.`
        });
      }
      
      // Call the callback if provided
      onDownload?.(resource);
      
    } catch (error) {
      console.error('Download failed:', error);
      toast({
        title: "Download failed",
        description: "There was an error downloading the file. Please try again.",
        variant: "destructive"
      });
    } finally {
      setDownloading(false);
    }
  };

  return (
    <Card className="group hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className={cn(
              "p-2 rounded-lg",
              getResourceTypeColor(resource.resource_type)
            )}>
              {getResourceIcon(resource.resource_type)}
            </div>
            <div className="flex-1 min-w-0">
              <CardTitle className="text-base line-clamp-2">{resource.title}</CardTitle>
              <div className="flex items-center gap-2 mt-1">
                <Badge variant="outline" className="text-xs">
                  {resource.resource_type}
                </Badge>
                {resource.access_level !== 'public' && (
                  <Badge variant="secondary" className="text-xs">
                    {resource.access_level === 'participants_only' ? 'Participants Only' : 'Registered Users'}
                  </Badge>
                )}
              </div>
            </div>
          </div>
          {showActions && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="opacity-0 group-hover:opacity-100">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => onEdit?.(resource)}>
                  Edit
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onDelete?.(resource)} className="text-destructive">
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </CardHeader>
      
      <CardContent className="pt-0">
        {resource.description && (
          <CardDescription className="mb-3 line-clamp-2">
            {resource.description}
          </CardDescription>
        )}
        
        <div className="flex items-center justify-between">
          <div className="text-xs text-muted-foreground">
            {resource.file_format && (
              <span className="uppercase">{resource.file_format}</span>
            )}
            {resource.file_size && (
              <span className="ml-2">
                {formatFileSize(resource.file_size)}
              </span>
            )}
          </div>
          
          <div className="flex gap-2">
            <Button size="sm" variant="outline" onClick={(e) => handleView(e)}>
              <Eye className="h-4 w-4 mr-1" />
              View
            </Button>
            {resource.is_downloadable && resource.file_url && (
              <Button size="sm" onClick={handleDownload} disabled={downloading}>
                {downloading ? (
                  <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                ) : (
                  <Download className="h-4 w-4 mr-1" />
                )}
                {downloading ? 'Downloading...' : 'Download'}
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
