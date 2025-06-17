
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';
import { OpportunityWithAuthor } from '@/types/opportunity/types';
import { getOpportunityTypeStyles } from '@/utils/opportunityUtils';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { 
  Calendar, 
  Clock, 
  Globe, 
  MapPin, 
  Tag,
  Briefcase,
  Building,
  Eye,
  Award,
  Bookmark,
  ChevronRight,
  UserCircle,
  Mail,
  ExternalLink
} from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

interface OpportunityDetailsDialogProps {
  opportunity?: OpportunityWithAuthor | null;
  isOpen: boolean;
  isLoading: boolean;
  onClose: () => void;
  onEdit: () => void;
  onApprove: () => void;
  onReject: () => void;
  onDelete: () => void;
  onToggleFeature: () => void;
}

export function OpportunityDetailsDialog({
  opportunity,
  isOpen,
  isLoading,
  onClose,
  onEdit,
  onApprove,
  onReject,
  onDelete,
  onToggleFeature,
}: OpportunityDetailsDialogProps) {
  const [activeTab, setActiveTab] = useState('details');

  const typeStyles = opportunity
    ? getOpportunityTypeStyles(opportunity.opportunity_type)
    : { bg: '', text: '', border: '' };

  if (!isOpen) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl flex items-center justify-between">
            {isLoading ? (
              <Skeleton className="h-8 w-3/4" />
            ) : (
              <div className="flex-1">
                <h2 className="text-xl font-bold">{opportunity?.title}</h2>
                <div className="flex items-center gap-2 mt-1">
                  <Badge className={`${typeStyles.bg} ${typeStyles.text} ${typeStyles.border}`}>
                    {opportunity?.opportunity_type}
                  </Badge>
                  {opportunity?.status && (
                    <Badge variant={
                      opportunity?.status === 'Active' ? 'default' : 
                      opportunity?.status === 'Pending' ? 'outline' : 
                      'destructive'
                    }>
                      {opportunity?.status}
                    </Badge>
                  )}
                  {opportunity?.featured && (
                    <Badge variant="secondary">Featured</Badge>
                  )}
                </div>
              </div>
            )}
          </DialogTitle>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3 mb-4">
            <TabsTrigger value="details">Details</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
            <TabsTrigger value="author">Author</TabsTrigger>
          </TabsList>

          <TabsContent value="details">
            {isLoading ? (
              <div className="space-y-4">
                <Skeleton className="h-40 w-full" />
                <Skeleton className="h-20 w-full" />
              </div>
            ) : (
              <div className="space-y-6">
                {opportunity?.cover_image_url && (
                  <div className="w-full">
                    <img 
                      src={opportunity.cover_image_url} 
                      alt={opportunity.title} 
                      className="w-full h-48 object-cover rounded-md mb-4"
                    />
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center gap-2">
                    <Building className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">Provider:</span> {opportunity?.provider_name}
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">Posted on:</span> {
                      opportunity?.created_at ? 
                      format(new Date(opportunity.created_at), 'MMM dd, yyyy') : 
                      'N/A'
                    }
                  </div>

                  {opportunity?.deadline && (
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium">Deadline:</span> {
                        format(new Date(opportunity.deadline), 'MMM dd, yyyy')
                      }
                    </div>
                  )}
                  
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">Location:</span> {
                      opportunity?.location || (opportunity?.remote ? 'Remote' : 'Not specified')
                    }
                  </div>

                  {opportunity?.remote !== undefined && (
                    <div className="flex items-center gap-2">
                      <Globe className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium">Remote:</span> {opportunity.remote ? 'Yes' : 'No'}
                    </div>
                  )}

                  {opportunity?.compensation && (
                    <div className="flex items-center gap-2">
                      <Briefcase className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium">Compensation:</span> {opportunity.compensation}
                    </div>
                  )}
                </div>

                {opportunity?.categories && opportunity?.categories.length > 0 && (
                  <div className="flex flex-wrap gap-2 items-center">
                    <Tag className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium mr-2">Categories:</span>
                    {opportunity.categories.map((category, i) => (
                      <Badge key={i} variant="outline">{category}</Badge>
                    ))}
                  </div>
                )}

                {opportunity?.tags && opportunity?.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2 items-center">
                    <Tag className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium mr-2">Tags:</span>
                    {opportunity.tags.map((tag, i) => (
                      <Badge key={i} variant="secondary">{tag}</Badge>
                    ))}
                  </div>
                )}

                <div className="mt-6">
                  <h3 className="text-lg font-semibold mb-2">Description</h3>
                  <div className="prose max-w-full">
                    {opportunity?.description?.split('\n').map((paragraph, idx) => (
                      <p key={idx}>{paragraph}</p>
                    ))}
                  </div>
                </div>

                {opportunity?.application_url && (
                  <div className="border-t pt-4">
                    <a 
                      href={opportunity.application_url} 
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 text-blue-600 hover:underline"
                    >
                      <ExternalLink className="h-4 w-4" />
                      View Application Link
                    </a>
                  </div>
                )}
              </div>
            )}
          </TabsContent>

          <TabsContent value="analytics">
            {isLoading ? (
              <div className="space-y-4">
                <Skeleton className="h-40 w-full" />
              </div>
            ) : (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-muted/50 rounded-lg p-6 flex flex-col items-center justify-center">
                    <Eye className="h-8 w-8 text-blue-600 mb-2" />
                    <span className="text-2xl font-bold">{opportunity?.analytics?.views_count || 0}</span>
                    <span className="text-sm text-muted-foreground">Views</span>
                  </div>
                  
                  <div className="bg-muted/50 rounded-lg p-6 flex flex-col items-center justify-center">
                    <Award className="h-8 w-8 text-green-600 mb-2" />
                    <span className="text-2xl font-bold">{opportunity?.analytics?.applications_count || 0}</span>
                    <span className="text-sm text-muted-foreground">Applications</span>
                  </div>
                  
                  <div className="bg-muted/50 rounded-lg p-6 flex flex-col items-center justify-center">
                    <Bookmark className="h-8 w-8 text-purple-600 mb-2" />
                    <span className="text-2xl font-bold">{opportunity?.analytics?.bookmarks_count || 0}</span>
                    <span className="text-sm text-muted-foreground">Bookmarks</span>
                  </div>
                </div>

                {opportunity?.analytics?.checked_out_count !== undefined && (
                  <div className="mt-6">
                    <h3 className="text-lg font-semibold mb-2">Engagement</h3>
                    <div className="bg-muted/50 rounded-lg p-6">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">Application Link Clicks</span>
                        <span className="font-bold">{opportunity.analytics.checked_out_count || 0}</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </TabsContent>

          <TabsContent value="author">
            {isLoading ? (
              <div className="space-y-4">
                <Skeleton className="h-20 w-full" />
              </div>
            ) : (
              <div className="space-y-4">
                {opportunity?.profiles ? (
                  <div className="bg-muted/50 rounded-lg p-6">
                    <div className="flex items-center gap-4">
                      {opportunity.profiles.avatar_url ? (
                        <img 
                          src={opportunity.profiles.avatar_url} 
                          alt={opportunity.profiles.full_name || ''}
                          className="h-16 w-16 rounded-full object-cover"
                        />
                      ) : (
                        <UserCircle className="h-16 w-16 text-muted-foreground" />
                      )}
                      
                      <div>
                        <h3 className="text-lg font-semibold">
                          {opportunity.profiles.full_name || 'Unknown User'}
                        </h3>
                        
                        <div className="flex items-center gap-2 mt-1">
                          <Mail className="h-4 w-4 text-muted-foreground" />
                          <a 
                            href={`mailto:${opportunity.profiles.email}`}
                            className="text-blue-600 hover:underline"
                          >
                            {opportunity.profiles.email}
                          </a>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center text-muted-foreground p-6">
                    No author information available
                  </div>
                )}
              </div>
            )}
          </TabsContent>
        </Tabs>

        <div className="mt-6 flex justify-between">
          <div>
            {opportunity?.status === 'Pending' && (
              <>
                <Button 
                  variant="default"
                  className="mr-2"
                  onClick={onApprove}
                >
                  Approve
                </Button>
                <Button 
                  variant="outline" 
                  className="text-red-600 border-red-200 hover:bg-red-50"
                  onClick={onReject}
                >
                  Reject
                </Button>
              </>
            )}
          </div>
          <div className="flex gap-2">
            <Button 
              variant="outline"
              onClick={onToggleFeature}
            >
              {opportunity?.featured ? 'Unfeature' : 'Feature'}
            </Button>
            <Button 
              variant="outline"
              onClick={onEdit}
            >
              Edit
            </Button>
            <Button 
              variant="destructive"
              onClick={onDelete}
            >
              Delete
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
