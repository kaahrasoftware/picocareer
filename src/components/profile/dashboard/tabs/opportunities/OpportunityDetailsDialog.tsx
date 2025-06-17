
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { OpportunityWithAuthor } from "@/types/database/opportunities";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ExternalLink, MapPin, Calendar, DollarSign } from "lucide-react";
import { format } from "date-fns";

interface OpportunityDetailsDialogProps {
  open: boolean;
  onClose: () => void;
  opportunity: OpportunityWithAuthor;
}

export function OpportunityDetailsDialog({ 
  open, 
  onClose, 
  opportunity 
}: OpportunityDetailsDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {opportunity.title}
            <Badge variant={opportunity.status === "Approved" ? "default" : "outline"}>
              {opportunity.status}
            </Badge>
            {opportunity.featured && (
              <Badge variant="secondary">Featured</Badge>
            )}
          </DialogTitle>
        </DialogHeader>
        
        <ScrollArea className="max-h-[60vh]">
          <div className="space-y-6">
            {/* Cover Image */}
            {opportunity.cover_image_url && (
              <div className="w-full h-48 bg-muted rounded-lg overflow-hidden">
                <img 
                  src={opportunity.cover_image_url} 
                  alt={opportunity.title}
                  className="w-full h-full object-cover"
                />
              </div>
            )}

            {/* Basic Info */}
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="flex items-center gap-2">
                <Badge variant="outline">{opportunity.opportunity_type}</Badge>
              </div>
              {opportunity.company_name && (
                <div>
                  <span className="font-medium">Company:</span> {opportunity.company_name}
                </div>
              )}
              {opportunity.location && (
                <div className="flex items-center gap-1">
                  <MapPin className="h-4 w-4" />
                  {opportunity.location}
                </div>
              )}
              {opportunity.remote_eligible && (
                <div>
                  <Badge variant="secondary">Remote Eligible</Badge>
                </div>
              )}
              {opportunity.salary_range && (
                <div className="flex items-center gap-1">
                  <DollarSign className="h-4 w-4" />
                  {opportunity.salary_range}
                </div>
              )}
              {opportunity.application_deadline && (
                <div className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  Deadline: {format(new Date(opportunity.application_deadline), 'MMM d, yyyy')}
                </div>
              )}
            </div>

            {/* Description */}
            <div>
              <h3 className="font-semibold mb-2">Description</h3>
              <p className="text-muted-foreground whitespace-pre-wrap">{opportunity.description}</p>
            </div>

            {/* Requirements */}
            {opportunity.requirements && opportunity.requirements.length > 0 && (
              <div>
                <h3 className="font-semibold mb-2">Requirements</h3>
                <div className="flex flex-wrap gap-2">
                  {opportunity.requirements.map((requirement, index) => (
                    <Badge key={index} variant="outline">
                      {requirement}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Benefits */}
            {opportunity.benefits && opportunity.benefits.length > 0 && (
              <div>
                <h3 className="font-semibold mb-2">Benefits</h3>
                <div className="flex flex-wrap gap-2">
                  {opportunity.benefits.map((benefit, index) => (
                    <Badge key={index} variant="outline">
                      {benefit}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Categories */}
            {opportunity.category && opportunity.category.length > 0 && (
              <div>
                <h3 className="font-semibold mb-2">Categories</h3>
                <div className="flex flex-wrap gap-2">
                  {opportunity.category.map((cat, index) => (
                    <Badge key={index} variant="outline">
                      {cat}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Analytics */}
            {opportunity.analytics && (
              <div className="grid grid-cols-3 gap-4 text-sm bg-muted/50 p-4 rounded-lg">
                <div className="text-center">
                  <div className="font-medium">{opportunity.analytics.views_count || 0}</div>
                  <div className="text-muted-foreground">Views</div>
                </div>
                <div className="text-center">
                  <div className="font-medium">{opportunity.analytics.bookmarks_count || 0}</div>
                  <div className="text-muted-foreground">Bookmarks</div>
                </div>
                <div className="text-center">
                  <div className="font-medium">{opportunity.analytics.applications_count || 0}</div>
                  <div className="text-muted-foreground">Applications</div>
                </div>
              </div>
            )}

            {/* Contact & Application */}
            <div className="flex gap-2">
              {opportunity.application_url && (
                <a
                  href={opportunity.application_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-primary hover:underline"
                >
                  Apply Now <ExternalLink className="h-4 w-4" />
                </a>
              )}
              {opportunity.contact_email && (
                <a
                  href={`mailto:${opportunity.contact_email}`}
                  className="text-primary hover:underline"
                >
                  Contact: {opportunity.contact_email}
                </a>
              )}
            </div>

            {/* Author Info */}
            <div className="pt-4 border-t">
              <p className="text-sm text-muted-foreground">
                Posted by {opportunity.profiles.full_name} on{' '}
                {format(new Date(opportunity.created_at), 'MMM d, yyyy')}
              </p>
            </div>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
