
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Download, 
  ExternalLink, 
  FileText, 
  Film, 
  Image, 
  Link, 
  Music, 
  Presentation,
  Eye,
  HardDrive
} from 'lucide-react';
import { EventResource } from '@/types/event-resources';
import { cn } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';

interface MobileEventResourceCardProps {
  resource: EventResource;
  onView?: (resource: EventResource) => void;
  onDownload?: (resource: EventResource) => void;
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
      return 'bg-red-50 text-red-700 border-red-200';
    case 'audio':
      return 'bg-purple-50 text-purple-700 border-purple-200';
    case 'document':
      return 'bg-blue-50 text-blue-700 border-blue-200';
    case 'presentation':
      return 'bg-orange-50 text-orange-700 border-orange-200';
    case 'image':
      return 'bg-green-50 text-green-700 border-green-200';
    case 'link':
      return 'bg-cyan-50 text-cyan-700 border-cyan-200';
    default:
      return 'bg-gray-50 text-gray-700 border-gray-200';
  }
};

const formatFileSize = (bytes?: number) => {
  if (!bytes) return null;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
};

export function MobileEventResourceCard({ resource, onView, onDownload }: MobileEventResourceCardProps) {
  return (
    <Card className="w-full">
      <CardContent className="p-4 space-y-4">
        {/* Header with icon and title */}
        <div className="flex items-start gap-3">
          <div className={cn("p-2 rounded-lg flex-shrink-0", getResourceTypeColor(resource.resource_type))}>
            {getResourceIcon(resource.resource_type)}
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-medium text-base leading-tight mb-1 break-words">
              {resource.title}
            </h3>
            {resource.description && (
              <p className="text-sm text-gray-600 line-clamp-2 mb-2">
                {resource.description}
              </p>
            )}
          </div>
        </div>

        {/* Badges */}
        <div className="flex flex-wrap gap-2">
          <Badge variant="outline" className="text-xs">
            {resource.resource_type}
          </Badge>
          {resource.file_format && (
            <Badge variant="secondary" className="text-xs uppercase">
              {resource.file_format}
            </Badge>
          )}
          {resource.access_level && (
            <Badge 
              variant={resource.access_level === 'public' ? 'default' : 'secondary'} 
              className="text-xs"
            >
              {resource.access_level === 'participants_only' 
                ? 'Participants' 
                : resource.access_level === 'registered'
                ? 'Registered'
                : 'Public'}
            </Badge>
          )}
        </div>

        {/* Stats */}
        <div className="flex items-center justify-between text-sm text-gray-500">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1">
              <Eye className="h-4 w-4" />
              <span>{resource.view_count || 0}</span>
            </div>
            <div className="flex items-center gap-1">
              <Download className="h-4 w-4" />
              <span>{resource.download_count || 0}</span>
            </div>
            {resource.file_size && (
              <div className="flex items-center gap-1">
                <HardDrive className="h-4 w-4" />
                <span>{formatFileSize(resource.file_size)}</span>
              </div>
            )}
          </div>
          {resource.created_at && (
            <span className="text-xs">
              {formatDistanceToNow(new Date(resource.created_at), { addSuffix: true })}
            </span>
          )}
        </div>

        {/* Action buttons - full width on mobile */}
        <div className="grid grid-cols-1 gap-2">
          <Button 
            onClick={() => onView?.(resource)}
            className="w-full flex items-center justify-center gap-2 h-11"
            size="sm"
          >
            <Eye className="h-4 w-4" />
            View Resource
          </Button>
          
          {resource.is_downloadable && resource.file_url && (
            <Button 
              variant="outline" 
              onClick={() => onDownload?.(resource)}
              className="w-full flex items-center justify-center gap-2 h-11"
              size="sm"
            >
              <Download className="h-4 w-4" />
              Download
            </Button>
          )}
          
          {(resource.external_url || resource.file_url) && (
            <Button 
              variant="outline" 
              onClick={() => {
                const url = resource.external_url || resource.file_url;
                if (url) window.open(url, '_blank', 'noopener,noreferrer');
              }}
              className="w-full flex items-center justify-center gap-2 h-11"
              size="sm"
            >
              <ExternalLink className="h-4 w-4" />
              Open External
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
