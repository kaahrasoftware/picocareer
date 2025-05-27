
import { Download, Eye, FileText, Film, Image, Link, Music, Presentation, MoreHorizontal, Loader2, TrendingUp } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { EventResource } from "@/types/event-resources";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";
import { useResourceTracking } from "@/hooks/useResourceTracking";

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
      return 'bg-red-100 text-red-800';
    case 'audio':
      return 'bg-purple-100 text-purple-800';
    case 'document':
      return 'bg-blue-100 text-blue-800';
    case 'presentation':
      return 'bg-orange-100 text-orange-800';
    case 'image':
      return 'bg-green-100 text-green-800';
    case 'link':
      return 'bg-cyan-100 text-cyan-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

const formatFileSize = (bytes?: number) => {
  if (!bytes) return null;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
};

const getEngagementLevel = (views: number, downloads: number) => {
  const total = views + downloads;
  if (total >= 50) return { level: 'high', label: 'Trending', color: 'bg-red-100 text-red-800' };
  if (total >= 20) return { level: 'medium', label: 'Popular', color: 'bg-orange-100 text-orange-800' };
  if (total >= 5) return { level: 'low', label: 'Active', color: 'bg-green-100 text-green-800' };
  return null;
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
  const { trackView, trackDownload } = useResourceTracking();

  const views = resource.view_count || 0;
  const downloads = resource.download_count || 0;
  const engagement = getEngagementLevel(views, downloads);

  const handleView = (event: React.MouseEvent<HTMLButtonElement>) => {
    console.log('🎯 View button clicked for resource:', resource.id, resource.title);
    
    // Track the view immediately
    trackView(resource.id, {
      source: 'resource_card',
      action: 'view_button_click',
      resource_title: resource.title,
      resource_type: resource.resource_type
    });

    if (onPreview) {
      event.preventDefault();
      onPreview(resource);
    } else if (resource.external_url) {
      console.log('🔗 Opening external URL:', resource.external_url);
      window.open(resource.external_url, '_blank', 'noopener,noreferrer');
    } else if (resource.file_url) {
      console.log('📁 Opening file URL:', resource.file_url);
      window.open(resource.file_url, '_blank', 'noopener,noreferrer');
    }
  };

  const handleDownload = async () => {
    console.log('⬇️ Download button clicked for resource:', resource.id, resource.title);
    
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
      
      // Track the download immediately
      trackDownload(resource.id, {
        source: 'resource_card',
        action: 'download_button_click',
        file_size: resource.file_size,
        file_format: resource.file_format,
        resource_title: resource.title,
        resource_type: resource.resource_type
      });
      
      console.log('📥 Download started for resource:', resource.id);
      
      const safeTitle = resource.title.replace(/[^a-z0-9]/gi, '_').toLowerCase();
      const fileExtension = resource.file_format ? `.${resource.file_format.toLowerCase()}` : '';
      const fileName = `${safeTitle}${fileExtension}`;
      
      try {
        const response = await fetch(resource.file_url);
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
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
        
        window.URL.revokeObjectURL(url);
        
        toast({
          title: "Download started",
          description: `${resource.title} is being downloaded.`
        });
        
      } catch (fetchError) {
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
      
      onDownload?.(resource);
      
    } catch (error) {
      console.error('❌ Download failed:', error);
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
                {engagement && (
                  <Badge className={cn("text-xs", engagement.color)}>
                    <TrendingUp className="h-3 w-3 mr-1" />
                    {engagement.label}
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
        
        {/* Engagement Stats */}
        {(views > 0 || downloads > 0) && (
          <div className="flex items-center gap-4 mb-3 text-xs text-muted-foreground">
            {views > 0 && (
              <div className="flex items-center gap-1">
                <Eye className="h-3 w-3" />
                <span>{views.toLocaleString()} views</span>
              </div>
            )}
            {downloads > 0 && (
              <div className="flex items-center gap-1">
                <Download className="h-3 w-3" />
                <span>{downloads.toLocaleString()} downloads</span>
              </div>
            )}
          </div>
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
