
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
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
  Calendar,
  User,
  Shield,
  HardDrive
} from 'lucide-react';
import { EventResource } from '@/types/event-resources';
import { cn } from '@/lib/utils';

interface ResourcePreviewModalProps {
  resource: EventResource | null;
  isOpen: boolean;
  onClose: () => void;
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
      return 'bg-red-50 text-red-700 border-red-200 dark:bg-red-900/20 dark:text-red-300 dark:border-red-800';
    case 'audio':
      return 'bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-900/20 dark:text-purple-300 dark:border-purple-800';
    case 'document':
      return 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/20 dark:text-blue-300 dark:border-blue-800';
    case 'presentation':
      return 'bg-orange-50 text-orange-700 border-orange-200 dark:bg-orange-900/20 dark:text-orange-300 dark:border-orange-800';
    case 'image':
      return 'bg-green-50 text-green-700 border-green-200 dark:bg-green-900/20 dark:text-green-300 dark:border-green-800';
    case 'link':
      return 'bg-cyan-50 text-cyan-700 border-cyan-200 dark:bg-cyan-900/20 dark:text-cyan-300 dark:border-cyan-800';
    default:
      return 'bg-gray-50 text-gray-700 border-gray-200 dark:bg-gray-900/20 dark:text-gray-300 dark:border-gray-800';
  }
};

const formatFileSize = (bytes?: number) => {
  if (!bytes) return null;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
};

export function ResourcePreviewModal({ resource, isOpen, onClose }: ResourcePreviewModalProps) {
  if (!resource) return null;

  const handleDownload = () => {
    if (resource.file_url && resource.is_downloadable) {
      const link = document.createElement('a');
      link.href = resource.file_url;
      link.download = resource.title;
      link.click();
    }
  };

  const handleOpenExternal = () => {
    const url = resource.external_url || resource.file_url;
    if (url) {
      window.open(url, '_blank');
    }
  };

  const renderPreviewContent = () => {
    const url = resource.external_url || resource.file_url;
    
    if (!url) {
      return (
        <div className="flex items-center justify-center h-64 bg-gray-50 dark:bg-gray-800 rounded-lg">
          <div className="text-center">
            <FileText className="h-12 w-12 mx-auto text-gray-400 mb-4" />
            <p className="text-gray-600 dark:text-gray-400">No preview available</p>
          </div>
        </div>
      );
    }

    switch (resource.resource_type) {
      case 'video':
        return (
          <div className="relative bg-black rounded-lg overflow-hidden" style={{ paddingBottom: '56.25%', height: 0 }}>
            <iframe
              src={url}
              title={resource.title}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              className="absolute top-0 left-0 w-full h-full"
            />
          </div>
        );

      case 'audio':
        return (
          <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-8">
            <div className="flex items-center justify-center mb-6">
              <div className={cn("p-4 rounded-full", getResourceTypeColor(resource.resource_type))}>
                <Music className="h-8 w-8" />
              </div>
            </div>
            <audio
              controls
              className="w-full"
              src={url}
            >
              Your browser does not support the audio element.
            </audio>
          </div>
        );

      case 'image':
        return (
          <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
            <img
              src={url}
              alt={resource.title}
              className="max-w-full max-h-96 mx-auto rounded-lg"
              onError={(e) => {
                e.currentTarget.style.display = 'none';
                e.currentTarget.nextElementSibling?.classList.remove('hidden');
              }}
            />
            <div className="hidden text-center py-12">
              <Image className="h-12 w-12 mx-auto text-gray-400 mb-4" />
              <p className="text-gray-600 dark:text-gray-400">Image could not be loaded</p>
            </div>
          </div>
        );

      case 'document':
      case 'presentation':
        return (
          <div className="bg-gray-50 dark:bg-gray-800 rounded-lg overflow-hidden" style={{ height: '500px' }}>
            <iframe
              src={url}
              title={resource.title}
              className="w-full h-full"
              onError={() => {
                // Fallback for iframe loading issues
              }}
            />
          </div>
        );

      case 'link':
        return (
          <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-8 text-center">
            <div className={cn("inline-flex p-4 rounded-full mb-4", getResourceTypeColor(resource.resource_type))}>
              <Link className="h-8 w-8" />
            </div>
            <h3 className="text-lg font-medium mb-2">External Link</h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              This resource links to an external website.
            </p>
            <Button onClick={handleOpenExternal} className="inline-flex items-center gap-2">
              <ExternalLink className="h-4 w-4" />
              Open Link
            </Button>
          </div>
        );

      default:
        return (
          <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-8 text-center">
            <div className={cn("inline-flex p-4 rounded-full mb-4", getResourceTypeColor(resource.resource_type))}>
              <FileText className="h-8 w-8" />
            </div>
            <h3 className="text-lg font-medium mb-2">File Preview</h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Preview not available for this file type.
            </p>
            <Button onClick={handleOpenExternal} className="inline-flex items-center gap-2">
              <Eye className="h-4 w-4" />
              Open File
            </Button>
          </div>
        );
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-start gap-3">
            <div className={cn("p-2 rounded-lg", getResourceTypeColor(resource.resource_type))}>
              {getResourceIcon(resource.resource_type)}
            </div>
            <div className="flex-1 min-w-0">
              <DialogTitle className="text-left line-clamp-2">
                {resource.title}
              </DialogTitle>
              {resource.description && (
                <DialogDescription className="text-left mt-2">
                  {resource.description}
                </DialogDescription>
              )}
            </div>
          </div>
        </DialogHeader>

        {/* Resource Metadata */}
        <div className="flex items-center gap-4 py-4 border-t border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="capitalize">
              {resource.resource_type}
            </Badge>
            {resource.file_format && (
              <Badge variant="secondary" className="uppercase font-mono">
                {resource.file_format}
              </Badge>
            )}
          </div>
          
          <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
            {resource.file_size && (
              <div className="flex items-center gap-1">
                <HardDrive className="h-4 w-4" />
                {formatFileSize(resource.file_size)}
              </div>
            )}
            
            <div className="flex items-center gap-1">
              <Shield className="h-4 w-4" />
              {resource.access_level === 'participants_only' 
                ? 'Participants Only' 
                : resource.access_level === 'registered'
                ? 'Registered Users'
                : 'Public Access'}
            </div>
            
            {resource.is_downloadable && (
              <div className="flex items-center gap-1 text-green-600 dark:text-green-400">
                <Download className="h-4 w-4" />
                Downloadable
              </div>
            )}
          </div>
        </div>

        {/* Preview Content */}
        <div className="py-4">
          {renderPreviewContent()}
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-700">
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
          
          <div className="flex items-center gap-2">
            {(resource.external_url || resource.file_url) && (
              <Button variant="outline" onClick={handleOpenExternal}>
                <ExternalLink className="h-4 w-4 mr-2" />
                Open External
              </Button>
            )}
            
            {resource.is_downloadable && resource.file_url && (
              <Button onClick={handleDownload}>
                <Download className="h-4 w-4 mr-2" />
                Download
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
