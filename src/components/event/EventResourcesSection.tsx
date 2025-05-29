
import React, { useState, useMemo, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Search, 
  Download, 
  Eye, 
  FileText, 
  Film, 
  Image, 
  Link, 
  Music, 
  Presentation, 
  Filter, 
  Calendar, 
  Clock, 
  User, 
  MapPin, 
  Loader2, 
  Lock, 
  UserPlus, 
  LogIn, 
  Archive,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { EventResource } from '@/types/event-resources';
import { ResourcePreviewModal } from './ResourcePreviewModal';
import { AuthPromptDialog } from '@/components/auth/AuthPromptDialog';
import { MobileResourceCard } from './MobileResourceCard';
import { MobileStatsGrid } from './MobileStatsGrid';
import { useAuth } from '@/context/AuthContext';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';
import { StandardPagination } from '@/components/common/StandardPagination';
import { useResourceTracking } from '@/hooks/useResourceTracking';
import { useMobileDetection } from '@/hooks/useMobileDetection';

// Constants
const ITEMS_PER_PAGE = 12;

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
  const [currentPage, setCurrentPage] = useState(1);
  const [previewResource, setPreviewResource] = useState<EventResource | null>(null);
  const [downloadingResources, setDownloadingResources] = useState<Set<string>>(new Set());
  const [showAuthDialog, setShowAuthDialog] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  
  const { toast } = useToast();
  const { session } = useAuth();
  const navigate = useNavigate();
  const { trackView, trackDownload } = useResourceTracking();
  const { isMobile, isTablet } = useMobileDetection();

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

  // Get unique resource types for filtering
  const resourceTypes = Array.from(new Set(resources.map(r => r.resource_type)));

  // Enhanced preview handler with tracking
  const handlePreview = (resource: EventResource) => {
    if (!session?.user) {
      setShowAuthDialog(true);
      return;
    }

    console.log('🎯 Tracking view from Preview button click for:', resource.id);
    trackView(resource.id, {
      source: 'preview_button',
      action: 'preview_click',
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
      
      console.log('🎯 Tracking download from Download button click for:', resource.id);
      trackDownload(resource.id, {
        source: 'download_button',
        action: 'download_click',
        resource_type: resource.resource_type,
        resource_title: resource.title,
        file_size: resource.file_size,
        file_format: resource.file_format
      });
      
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

  return (
    <div className="space-y-6" data-resources-section>
      {/* Event Info Header */}
      {eventInfo && (
        <Card className="border-2 border-blue-100 bg-gradient-to-r from-blue-50/50 to-purple-50/50">
          <CardContent className="p-4 md:p-6">
            <div className="flex items-start gap-4">
              <div className="p-3 rounded-lg bg-primary/10 text-primary">
                <Calendar className="h-6 w-6" />
              </div>
              <div className="flex-1">
                <div className="flex flex-col gap-3 mb-3 md:flex-row md:items-start md:justify-between">
                  <h2 className="text-xl font-semibold text-gray-900">
                    {eventInfo.title}
                  </h2>
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge variant="default" className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1">
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
                <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
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

      {/* Resource Statistics */}
      <MobileStatsGrid resources={resources} filteredCount={filteredResources.length} />

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
              
              <div className="flex flex-col gap-3 justify-center">
                <Button onClick={handleSignIn} className="flex items-center gap-2 h-12">
                  <LogIn className="h-4 w-4" />
                  Sign In
                </Button>
                <Button variant="outline" onClick={handleSignUp} className="flex items-center gap-2 h-12">
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
              {/* Search and Filters */}
              <Card>
                <CardContent className="p-4 space-y-4">
                  {/* Search */}
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input 
                      placeholder="Search resources..." 
                      value={searchQuery} 
                      onChange={(e) => setSearchQuery(e.target.value)} 
                      className="pl-10 h-12 text-base" 
                    />
                  </div>
                  
                  {/* Mobile: Collapsible filters */}
                  {(isMobile || isTablet) ? (
                    <div className="space-y-3">
                      <Button
                        variant="outline"
                        onClick={() => setShowFilters(!showFilters)}
                        className="w-full justify-between h-12"
                      >
                        <span className="flex items-center gap-2">
                          <Filter className="h-4 w-4" />
                          Resource Types
                        </span>
                        <div className="flex items-center gap-2">
                          <Badge variant="secondary">
                            {selectedType === 'all' ? 'All' : selectedType}
                          </Badge>
                          {showFilters ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                        </div>
                      </Button>
                      
                      {showFilters && (
                        <div className="grid grid-cols-2 gap-2">
                          <Button 
                            variant={selectedType === 'all' ? 'default' : 'outline'} 
                            size="sm" 
                            onClick={() => setSelectedType('all')}
                            className="h-12 text-sm"
                          >
                            All Types
                          </Button>
                          {resourceTypes.map((type) => (
                            <Button 
                              key={type} 
                              variant={selectedType === type ? 'default' : 'outline'} 
                              size="sm" 
                              onClick={() => setSelectedType(type)} 
                              className="capitalize h-12 text-sm flex items-center gap-2"
                            >
                              {getResourceIcon(type)}
                              <span className="truncate">{type}</span>
                            </Button>
                          ))}
                        </div>
                      )}
                    </div>
                  ) : (
                    /* Desktop: Inline filters */
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
                  )}

                  {/* Results info */}
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

              {/* Resources Grid - Mobile only uses grid view */}
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
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {paginatedResources.map((resource) => (
                      <MobileResourceCard
                        key={resource.id}
                        resource={resource}
                        onView={handlePreview}
                        onDownload={handleDownload}
                        isDownloading={downloadingResources.has(resource.id)}
                      />
                    ))}
                  </div>

                  {/* Pagination */}
                  {totalPages > 1 && (
                    <StandardPagination
                      currentPage={currentPage}
                      totalPages={totalPages}
                      onPageChange={setCurrentPage}
                      showPageNumbers={!isMobile}
                      maxPageButtons={isMobile ? 3 : 5}
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
