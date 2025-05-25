
import { Download, Eye, FileText, Film, Image, Link, Music, Presentation, MoreHorizontal } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { EventResource } from "@/types/event-resources";
import { cn } from "@/lib/utils";

interface EventResourceCardProps {
  resource: EventResource;
  onView?: (resource: EventResource) => void;
  onDownload?: (resource: EventResource) => void;
  onEdit?: (resource: EventResource) => void;
  onDelete?: (resource: EventResource) => void;
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
  showActions = false 
}: EventResourceCardProps) {
  const handleView = () => {
    if (resource.external_url) {
      window.open(resource.external_url, '_blank');
    } else if (resource.file_url) {
      window.open(resource.file_url, '_blank');
    }
    onView?.(resource);
  };

  const handleDownload = () => {
    if (resource.file_url && resource.is_downloadable) {
      const link = document.createElement('a');
      link.href = resource.file_url;
      link.download = resource.title;
      link.click();
    }
    onDownload?.(resource);
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
            <Button size="sm" variant="outline" onClick={handleView}>
              <Eye className="h-4 w-4 mr-1" />
              View
            </Button>
            {resource.is_downloadable && resource.file_url && (
              <Button size="sm" onClick={handleDownload}>
                <Download className="h-4 w-4 mr-1" />
                Download
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
