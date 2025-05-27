import React, { useState, useMemo, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Search, Download, Eye, FileText, Film, Image, Link, Music, Presentation, Filter, Grid3X3, List, Calendar, Clock, User, MapPin, Loader2, Lock, UserPlus, LogIn, TrendingUp, Archive, Zap } from 'lucide-react';
import { EventResource } from '@/types/event-resources';
import { ResourcePreviewModal } from './ResourcePreviewModal';
import { ResourceLoadingSkeleton } from './ResourceLoadingSkeleton';
import { AuthPromptDialog } from '@/components/auth/AuthPromptDialog';
import { useAuth } from '@/context/AuthContext';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';
import { StandardPagination } from '@/components/common/StandardPagination';
import { useResourceTracking } from '@/hooks/useResourceTracking';

// Constants
const ITEMS_PER_PAGE = 18;

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
      return 'bg-red-100 text-red-800 border-red-200';
    case 'audio':
      return 'bg-purple-100 text-purple-800 border-purple-200';
    case 'document':
      return 'bg-blue-100 text-blue-800 border-blue-200';
    case 'presentation':
      return 'bg-orange-100 text-orange-800 border-orange-200';
    case 'image':
      return 'bg-green-100 text-green-800 border-green-200';
    case 'link':
      return 'bg-cyan-100 text-cyan-800 border-cyan-200';
    default:
      return 'bg-gray-100 text-gray-800 border-gray-200';
  }
};

const formatFileSize = (bytes?: number) => {
  if (!bytes || bytes === 0) return null;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
};

const ResourceStatsCards = ({ resources, filteredCount }: { resources: (EventResource & { events?: any })[], filteredCount: number }) => {
  const downloadableCount = resources.filter(r => r.is_downloadable).length;
  const typeBreakdown = resources.reduce((acc, resource) => {
    acc[resource.resource_type] = (acc[resource.resource_type] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  // Use actual file sizes when available, fall back to estimates
  const totalSize = resources.reduce((total, resource) => {
    // Use actual file size if available
    if (resource.file_size && resource.file_size > 0) {
      return total + resource.file_size;
    }
    
    // Fall back to estimates for resources without recorded file sizes
    let estimatedSize = 0;
    if (resource.file_url) {
      switch (resource.resource_type) {
        case 'video':
          estimatedSize = 5000000; // 5MB
          break;
        case 'audio':
          estimatedSize = 2000000; // 2MB
          break;
        case 'document':
          estimatedSize = 500000; // 500KB
          break;
        case 'presentation':
          estimatedSize = 3000000; // 3MB
          break;
        case 'image':
          estimatedSize = 300000; // 300KB
          break;
        default:
          estimatedSize = 100000; // 100KB
      }
    }
    return total + estimatedSize;
  }, 0);

  const formatTotalSize = (bytes: number) => {
    if (bytes === 0) return 'N/A';
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {/* Total Resources */}
      <Card className="hover:shadow-md transition-shadow">
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-blue-100 text-blue-600">
              <Archive className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Total Resources</p>
              <div className="flex items-center gap-2">
                <p className="text-2xl font-bold text-gray-900">{resources.length}</p>
                {filteredCount !== resources.length && (
                  <Badge variant="secondary" className="text-xs">
                    {filteredCount} shown
                  </Badge>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Downloadable Resources */}
      <Card className="hover:shadow-md transition-shadow">
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-green-100 text-green-600">
              <Download className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Downloadable</p>
              <div className="flex items-center gap-2">
                <p className="text-2xl font-bold text-gray-900">{downloadableCount}</p>
                {resources.length > 0 && (
                  <Badge variant="secondary" className="text-xs">
                    {Math.round((downloadableCount / resources.length) * 100)}%
                  </Badge>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Resource Types */}
      <Card className="hover:shadow-md transition-shadow">
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-purple-100 text-purple-600">
              <TrendingUp className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Resource Types</p>
              <p className="text-2xl font-bold text-gray-900">{Object.keys(typeBreakdown).length}</p>
              <div className="flex gap-1 mt-1">
                {Object.entries(typeBreakdown).slice(0, 3).map(([type, count]) => (
                  <Badge key={type} variant="outline" className="text-xs capitalize">
                    {type}: {count}
                  </Badge>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Total Size - Now uses actual file sizes */}
      <Card className="hover:shadow-md transition-shadow">
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-orange-100 text-orange-600">
              <Zap className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Total Size</p>
              <p className="text-2xl font-bold text-gray-900">{formatTotalSize(totalSize)}</p>
              {resources.length > 0 && (
                <p className="text-xs text-gray-500">
                  Avg: {formatTotalSize(totalSize / resources.length)}
                </p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

interface EventResourcesSectionProps {
  resources: (EventResource & {
    events?: {
      id: string;
      title: string;
      start_time: string;
      organized_by?: string;
    };
  })[];
  onPreview?: (resource: EventResource) => void;
  eventInfo?: {
    id: string;
    title: string;
    start_time?: string;
    end_time?: string;
    platform?: string;
    organized_by?: string;
  };
}

export function EventResourcesSection({
  resources,
  onPreview,
  eventInfo
}: EventResourcesSectionProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('list');
  const [currentPage, setCurrentPage] = useState(1);
  const [previewResource, setPreviewResource] = useState<EventResource | null>(null);
  const [downloadingResources, setDownloadingResources] = useState<Set<string>>(new Set());
  const [showAuthDialog, setShowAuthDialog] = useState(false);
  const { toast } = useToast();
  const { session } = useAuth();
  const navigate = useNavigate();
  const { trackView, trackDownload } = useResourceTracking();

  const handleSignIn = () => {
    setShowAuthDialog(false);
    navigate("/auth?tab=signin", {
      state: {
        redirectUrl: "/event"
      }
    });
  };

  const handleSignUp = () => {
    setShowAuthDialog(false);
    navigate("/auth?tab=signup", {
      state: {
        redirectUrl: "/event"
      }
    });
  };

  // Filter resources based on search and type (for authenticated users)
  const filteredResources = useMemo(() => {
    if (!session?.user) return resources;
    
    return resources.filter(resource => {
      const matchesSearch = resource.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
        (resource.description && resource.description.toLowerCase().includes(searchQuery.toLowerCase()));
      const matchesType = selectedType === 'all' || resource.resource_type === selectedType;
      return matchesSearch && matchesType;
    });
  }, [resources, searchQuery, selectedType, session?.user]);

  // Pagination calculations
  const totalPages = Math.ceil(filteredResources.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const paginatedResources = filteredResources.slice(startIndex, endIndex);

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, selectedType]);

  // Scroll to top of resources when page changes
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    // Smooth scroll to the resources section
    const resourcesSection = document.querySelector('[data-resources-section]');
    if (resourcesSection) {
      resourcesSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  // Get unique resource types for filtering
  const resourceTypes = Array.from(new Set(resources.map(r => r.resource_type)));

  // Enhanced preview handler with tracking
  const handlePreview = (resource: EventResource) => {
    if (!session?.user) {
      setShowAuthDialog(true);
      return;
    }

    // Track the view when user clicks Preview button
    console.log('🎯 Tracking view from Preview button click for:', resource.id);
    trackView(resource.id, {
      source: 'preview_button',
      action: 'preview_click',
      view_mode: viewMode,
      resource_type: resource.resource_type,
      resource_title: resource.title
    });

    setPreviewResource(resource);
    onPreview?.(resource);
  };

  // Enhanced download handler with tracking
  const handleDownload = async (resource: EventResource) => {
    if (!session?.user) {
      setShowAuthDialog(true);
      return;
    }

    if (!resource.file_url || !resource.is_downloadable) {
      toast({
        title: "Download not available",
        description: "This resource cannot be downloaded.",
        variant: "destructive"
      });
      return;
    }

    try {
      setDownloadingResources(prev => new Set(prev).add(resource.id));
      
      // Track the download when user clicks Download button
      console.log('🎯 Tracking download from Download button click for:', resource.id);
      trackDownload(resource.id, {
        source: 'download_button',
        action: 'download_click',
        view_mode: viewMode,
        resource_type: resource.resource_type,
        resource_title: resource.title,
        file_size: resource.file_size,
        file_format: resource.file_format
      });
      
      console.log('📁 Starting file download for resource:', resource.id);
      
      // Create a safe filename from the resource title and format
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
    } catch (error) {
      console.error('Download failed:', error);
      toast({
        title: "Download failed",
        description: "There was an error downloading the file. Please try again.",
        variant: "destructive"
      });
    } finally {
      setDownloadingResources(prev => {
        const newSet = new Set(prev);
        newSet.delete(resource.id);
        return newSet;
      });
    }
  };

  // Resource card component (removed hover tracking)
  const ResourceCard = ({ resource }: { resource: EventResource & { events?: any } }) => {
    const isDownloading = downloadingResources.has(resource.id);
    
    return (
      <Card className="group hover:shadow-md transition-all duration-200 border border-gray-200">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <div className={cn("p-2 rounded-lg shrink-0", getResourceTypeColor(resource.resource_type))}>
              {getResourceIcon(resource.resource_type)}
            </div>
            
            <div className="flex-1 min-w-0">
              <h3 className="font-medium text-gray-900 line-clamp-1 mb-1">
                {resource.title}
              </h3>
              
              {resource.description && (
                <p className="text-sm text-gray-600 line-clamp-2 mb-2">
                  {resource.description}
                </p>
              )}
              
              <div className="flex items-center gap-2 mb-3 flex-wrap">
                <Badge variant="outline" className="text-xs capitalize">
                  {resource.resource_type}
                </Badge>
                
                {resource.file_format && (
                  <Badge variant="secondary" className="text-xs uppercase font-mono">
                    {resource.file_format}
                  </Badge>
                )}
                
                <Badge variant={resource.access_level === 'public' ? 'default' : 'secondary'} className="text-xs">
                  {resource.access_level === 'participants_only' ? 'Participants' : 
                   resource.access_level === 'registered' ? 'Registered' : 'Public'}
                </Badge>
                
                {resource.file_size && (
                  <span className="text-xs text-gray-500">
                    {formatFileSize(resource.file_size)}
                  </span>
                )}

                {resource.events && (
                  <Badge variant="outline" className="text-xs bg-blue-50 text-blue-700 border-blue-200">
                    <Calendar className="h-3 w-3 mr-1" />
                    {resource.events.title}
                  </Badge>
                )}
              </div>

              {resource.events && (
                <div className="flex items-center gap-1 text-xs text-gray-500 mb-3">
                  <Clock className="h-3 w-3" />
                  {format(new Date(resource.events.start_time), 'MMM d, yyyy')}
                  {resource.events.organized_by && (
                    <>
                      <span className="mx-1">•</span>
                      {resource.events.organized_by}
                    </>
                  )}
                </div>
              )}
              
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={() => handlePreview(resource)} className="flex-1">
                  <Eye className="h-4 w-4 mr-2" />
                  Preview
                </Button>
                
                {resource.is_downloadable && resource.file_url && (
                  <Button variant="outline" size="sm" onClick={() => handleDownload(resource)} disabled={isDownloading}>
                    {isDownloading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
                  </Button>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  // Resource list item component (removed hover tracking)
  const ResourceListItem = ({ resource }: { resource: EventResource & { events?: any } }) => {
    const isDownloading = downloadingResources.has(resource.id);
    
    return (
      <div className="group hover:bg-gray-50 p-4 rounded-lg border border-gray-200 transition-colors">
        <div className="flex items-center gap-4">
          <div className={cn("p-2 rounded-lg shrink-0", getResourceTypeColor(resource.resource_type))}>
            {getResourceIcon(resource.resource_type)}
          </div>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 min-w-0">
                <h3 className="font-medium text-gray-900 line-clamp-1">
                  {resource.title}
                </h3>
                {resource.description && (
                  <p className="text-sm text-gray-600 line-clamp-1 mt-1">
                    {resource.description}
                  </p>
                )}

                {resource.events && (
                  <div className="flex items-center gap-2 mt-2">
                    <Badge variant="outline" className="text-xs bg-blue-50 text-blue-700 border-blue-200">
                      <Calendar className="h-3 w-3 mr-1" />
                      {resource.events.title}
                    </Badge>
                    <span className="text-xs text-gray-500">
                      {format(new Date(resource.events.start_time), 'MMM d, yyyy')}
                    </span>
                  </div>
                )}
              </div>
              
              <div className="flex items-center gap-2 shrink-0">
                <Badge variant="outline" className="text-xs capitalize">
                  {resource.resource_type}
                </Badge>
                
                {resource.file_format && (
                  <Badge variant="secondary" className="text-xs uppercase font-mono">
                    {resource.file_format}
                  </Badge>
                )}
                
                <Badge variant={resource.access_level === 'public' ? 'default' : 'secondary'} className="text-xs">
                  {resource.access_level === 'participants_only' ? 'Participants' : 
                   resource.access_level === 'registered' ? 'Registered' : 'Public'}
                </Badge>
              </div>
            </div>
            
            <div className="flex items-center justify-between mt-3">
              <div className="flex items-center gap-4 text-xs text-gray-500">
                {resource.file_size && <span>{formatFileSize(resource.file_size)}</span>}
                {resource.is_downloadable && <span className="text-green-600">Downloadable</span>}
              </div>
              
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={() => handlePreview(resource)}>
                  <Eye className="h-4 w-4 mr-2" />
                  Preview
                </Button>
                
                {resource.is_downloadable && resource.file_url && (
                  <Button variant="outline" size="sm" onClick={() => handleDownload(resource)} disabled={isDownloading}>
                    {isDownloading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6" data-resources-section>
      {/* Enhanced Event Info Header - Now visible to all users with prominent resource counts */}
      {eventInfo && (
        <Card className="border-2 border-blue-100 bg-gradient-to-r from-blue-50/50 to-purple-50/50">
          <CardContent className="p-6">
            <div className="flex items-start gap-4">
              <div className="p-3 rounded-lg bg-primary/10 text-primary">
                <Calendar className="h-6 w-6" />
              </div>
              <div className="flex-1">
                <div className="flex items-start justify-between gap-4 mb-3">
                  <h2 className="text-xl font-semibold text-gray-900">
                    {eventInfo.title}
                  </h2>
                  <div className="flex items-center gap-2">
                    <Badge variant="default" className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 animate-pulse">
                      <Archive className="h-4 w-4 mr-1" />
                      {resources.length} Resources
                    </Badge>
                    {resources.filter(r => r.is_downloadable).length > 0 && (
                      <Badge variant="secondary" className="px-3 py-1 bg-green-100 text-green-800 border-green-200">
                        <Download className="h-3 w-3 mr-1" />
                        {resources.filter(r => r.is_downloadable).length} Downloadable
                      </Badge>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-4 text-sm text-gray-600">
                  {eventInfo.start_time && (
                    <div className="flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      {format(new Date(eventInfo.start_time), 'PPP p')}
                    </div>
                  )}
                  {eventInfo.platform && (
                    <div className="flex items-center gap-1">
                      <MapPin className="h-4 w-4" />
                      {eventInfo.platform}
                    </div>
                  )}
                  {eventInfo.organized_by && (
                    <div className="flex items-center gap-1">
                      <User className="h-4 w-4" />
                      {eventInfo.organized_by}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Resource Statistics Cards - Now visible to all users */}
      <ResourceStatsCards resources={resources} filteredCount={filteredResources.length} />

      {/* Show authentication required content if user is not logged in */}
      {!session?.user ? (
        <Card>
          <CardContent className="py-12 text-center">
            <div className="max-w-md mx-auto">
              <div className="p-4 rounded-full bg-primary/10 text-primary inline-flex mb-6">
                <Lock className="h-8 w-8" />
              </div>
              
              <h3 className="text-xl font-semibold text-gray-900 mb-3">
                Sign In Required
              </h3>
              
              <p className="text-gray-600 mb-4">
                You need to sign in to your account or create a new account to access, preview, and download event resources.
              </p>
              
              {resources.length > 0 && (
                <div className="mb-6 space-y-3">
                  <div className="p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border border-blue-200">
                    <div className="flex items-center justify-center gap-2 mb-2">
                      <Archive className="h-5 w-5 text-blue-600" />
                      <Badge variant="default" className="text-lg px-4 py-2 bg-blue-600 hover:bg-blue-700">
                        {resources.length} Resource{resources.length !== 1 ? 's' : ''} Available
                      </Badge>
                    </div>
                    <p className="text-sm text-blue-700">
                      Access exclusive event materials, downloads, and presentations
                    </p>
                  </div>
                </div>
              )}
              
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Button onClick={handleSignIn} className="flex items-center gap-2">
                  <LogIn className="h-4 w-4" />
                  Sign In
                </Button>
                <Button variant="outline" onClick={handleSignUp} className="flex items-center gap-2">
                  <UserPlus className="h-4 w-4" />
                  Create Account
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Content for authenticated users */}
          {resources.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <FileText className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  No Resources Available
                </h3>
                <p className="text-gray-600">
                  There are no resources available for this event yet.
                </p>
              </CardContent>
            </Card>
          ) : (
            <>
              {/* Header with Search and Filters - Only for authenticated users */}
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                      <FileText className="h-5 w-5" />
                      Event Resources
                      <div className="flex items-center gap-2 ml-2">
                        <Badge variant="secondary" className="bg-blue-100 text-blue-800 border-blue-200 px-3 py-1">
                          {filteredResources.length} of {resources.length}
                        </Badge>
                        {filteredResources.length !== resources.length && (
                          <Badge variant="outline" className="text-orange-700 border-orange-300 bg-orange-50">
                            Filtered
                          </Badge>
                        )}
                      </div>
                    </CardTitle>
                    
                    <div className="flex items-center gap-2">
                      <Button variant={viewMode === 'list' ? 'default' : 'outline'} size="sm" onClick={() => setViewMode('list')}>
                        <List className="h-4 w-4" />
                      </Button>
                      <Button variant={viewMode === 'grid' ? 'default' : 'outline'} size="sm" onClick={() => setViewMode('grid')}>
                        <Grid3X3 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent className="space-y-4">
                  {/* Search */}
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input 
                      placeholder="Search resources..." 
                      value={searchQuery} 
                      onChange={(e) => setSearchQuery(e.target.value)} 
                      className="pl-10" 
                    />
                  </div>
                  
                  {/* Type Filters */}
                  <div className="flex items-center gap-2 flex-wrap">
                    <Button 
                      variant={selectedType === 'all' ? 'default' : 'outline'} 
                      size="sm" 
                      onClick={() => setSelectedType('all')}
                    >
                      All Types
                      <Badge variant="secondary" className="ml-2 bg-gray-100 text-gray-700">
                        {resources.length}
                      </Badge>
                    </Button>
                    {resourceTypes.map((type) => {
                      const typeCount = resources.filter(r => r.resource_type === type).length;
                      return (
                        <Button 
                          key={type} 
                          variant={selectedType === type ? 'default' : 'outline'} 
                          size="sm" 
                          onClick={() => setSelectedType(type)} 
                          className="capitalize"
                        >
                          {getResourceIcon(type)}
                          <span className="ml-2">{type}</span>
                          <Badge variant="secondary" className="ml-2 bg-gray-100 text-gray-700 text-xs">
                            {typeCount}
                          </Badge>
                        </Button>
                      );
                    })}
                  </div>

                  {/* Pagination Info */}
                  {filteredResources.length > 0 && (
                    <div className="flex items-center justify-between text-sm text-gray-600 pt-2 border-t">
                      <span>
                        Showing {startIndex + 1}-{Math.min(endIndex, filteredResources.length)} of {filteredResources.length} resources
                      </span>
                      <span>
                        Page {currentPage} of {totalPages}
                      </span>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Resources Display - Only for authenticated users */}
              {filteredResources.length === 0 ? (
                <Card>
                  <CardContent className="py-12 text-center">
                    <Search className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      No Results Found
                    </h3>
                    <p className="text-gray-600">
                      Try adjusting your search or filter criteria.
                    </p>
                    <div className="mt-4">
                      <Badge variant="outline" className="text-gray-600">
                        {resources.length} total resources available
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <>
                  <div className={cn(
                    viewMode === 'grid' 
                      ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4" 
                      : "space-y-3"
                  )}>
                    {paginatedResources.map((resource) => 
                      viewMode === 'grid' ? (
                        <ResourceCard key={resource.id} resource={resource} />
                      ) : (
                        <ResourceListItem key={resource.id} resource={resource} />
                      )
                    )}
                  </div>

                  {/* Pagination Controls */}
                  {totalPages > 1 && (
                    <StandardPagination
                      currentPage={currentPage}
                      totalPages={totalPages}
                      onPageChange={handlePageChange}
                      showPageNumbers={true}
                      maxPageButtons={5}
                    />
                  )}
                </>
              )}
            </>
          )}
        </>
      )}

      {/* Preview Modal */}
      <ResourcePreviewModal 
        resource={previewResource} 
        isOpen={!!previewResource} 
        onClose={() => setPreviewResource(null)} 
      />

      {/* Auth Prompt Dialog */}
      <AuthPromptDialog 
        isOpen={showAuthDialog} 
        onClose={() => setShowAuthDialog(false)} 
        title="Access Event Resources" 
        description="Sign in or create an account to view and download event resources." 
        redirectUrl="/event" 
      />
    </div>
  );
}
