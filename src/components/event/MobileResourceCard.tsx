
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Download, 
  Eye, 
  FileText, 
  Film, 
  Image, 
  Link, 
  Music, 
  Presentation,
  Calendar,
  HardDrive,
  Clock
} from 'lucide-react';
import { EventResource } from '@/types/event-resources';
import { cn } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';

interface MobileResourceCardProps {
  resource: EventResource & {
    events?: {
      id: string;
      title: string;
      start_time: string;
      organized_by?: string;
    };
  };
  onView?: (resource: EventResource) => void;
  onDownload?: (resource: EventResource) => void;
  isDownloading?: boolean;
}

const getResourceIcon = (type: EventResource['resource_type']) => {
  const iconClass = "h-6 w-6";
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

export function MobileResourceCard({ 
  resource, 
  onView, 
  onDownload, 
  isDownloading = false 
}: MobileResourceCardProps) {
  return (
    <Card className="w-full shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
      <CardContent className="p-5 space-y-4">
        {/* Header with icon and type */}
        <div className="flex items-center gap-3">
          <div className={cn("p-3 rounded-xl flex-shrink-0", getResourceTypeColor(resource.resource_type))}>
            {getResourceIcon(resource.resource_type)}
          </div>
          <div className="flex-1 min-w-0">
            <Badge variant="outline" className="text-xs font-medium capitalize mb-1">
              {resource.resource_type}
            </Badge>
            <h3 className="font-semibold text-lg leading-tight text-gray-900 break-words">
              {resource.title}
            </h3>
          </div>
        </div>

        {/* Description */}
        {resource.description && (
          <p className="text-sm text-gray-600 leading-relaxed line-clamp-3">
            {resource.description}
          </p>
        )}

        {/* Event info for cross-event resources */}
        {resource.events && (
          <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
            <div className="flex items-center gap-2 mb-1">
              <Calendar className="h-4 w-4 text-blue-600" />
              <span className="text-sm font-medium text-blue-900">
                {resource.events.title}
              </span>
            </div>
            <div className="flex items-center gap-2 text-xs text-blue-700">
              <Clock className="h-3 w-3" />
              {formatDistanceToNow(new Date(resource.events.start_time), { addSuffix: true })}
              {resource.events.organized_by && (
                <>
                  <span className="mx-1">•</span>
                  {resource.events.organized_by}
                </>
              )}
            </div>
          </div>
        )}

        {/* Metadata tags */}
        <div className="flex flex-wrap gap-2">
          {resource.file_format && (
            <Badge variant="secondary" className="text-xs uppercase font-mono bg-gray-100 text-gray-700">
              {resource.file_format}
            </Badge>
          )}
          
          <Badge 
            variant={resource.access_level === 'public' ? 'default' : 'secondary'} 
            className="text-xs"
          >
            {resource.access_level === 'participants_only' 
              ? 'Participants Only' 
              : resource.access_level === 'registered'
              ? 'Registered Users'
              : 'Public Access'}
          </Badge>

          {resource.file_size && (
            <div className="flex items-center gap-1 text-xs text-gray-500 bg-gray-50 px-2 py-1 rounded">
              <HardDrive className="h-3 w-3" />
              {formatFileSize(resource.file_size)}
            </div>
          )}
        </div>

        {/* Stats */}
        <div className="flex items-center justify-between text-sm text-gray-500 pt-2 border-t border-gray-100">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1">
              <Eye className="h-4 w-4" />
              <span>{resource.view_count || 0} views</span>
            </div>
            <div className="flex items-center gap-1">
              <Download className="h-4 w-4" />
              <span>{resource.download_count || 0} downloads</span>
            </div>
          </div>
          {resource.created_at && (
            <span className="text-xs">
              {formatDistanceToNow(new Date(resource.created_at), { addSuffix: true })}
            </span>
          )}
        </div>

        {/* Action buttons - optimized for mobile touch */}
        <div className="space-y-3 pt-2">
          <Button 
            onClick={() => onView?.(resource)}
            className="w-full h-12 text-base font-medium flex items-center justify-center gap-3"
            size="lg"
          >
            <Eye className="h-5 w-5" />
            Preview Resource
          </Button>
          
          {resource.is_downloadable && resource.file_url && (
            <Button 
              variant="outline" 
              onClick={() => onDownload?.(resource)}
              disabled={isDownloading}
              className="w-full h-12 text-base font-medium flex items-center justify-center gap-3"
              size="lg"
            >
              <Download className="h-5 w-5" />
              {isDownloading ? 'Downloading...' : 'Download'}
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
