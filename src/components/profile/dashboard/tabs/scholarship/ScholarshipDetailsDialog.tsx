
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ScholarshipDetails } from "@/types/database/scholarships";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ExternalLink, Calendar, DollarSign, Mail, Phone } from "lucide-react";
import { format } from "date-fns";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

interface ScholarshipDetailsDialogProps {
  open: boolean;
  onClose: () => void;
  scholarshipId: string;
}

export function ScholarshipDetailsDialog({ 
  open, 
  onClose, 
  scholarshipId 
}: ScholarshipDetailsDialogProps) {
  const [scholarship, setScholarship] = useState<ScholarshipDetails | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (open && scholarshipId) {
      fetchScholarship();
    }
  }, [open, scholarshipId]);

  const fetchScholarship = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('scholarships')
        .select('*')
        .eq('id', scholarshipId)
        .single();

      if (error) throw error;

      // Ensure all required fields are present
      const scholarshipWithDefaults: ScholarshipDetails = {
        ...data,
        currency: data.currency || 'USD', // Add default currency if missing
        views_count: data.views_count || 0,
        bookmarks_count: data.bookmarks_count || 0,
        applications_count: data.applications_count || 0,
      };
      
      setScholarship(scholarshipWithDefaults);
    } catch (error) {
      console.error('Error fetching scholarship:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Dialog open={open} onOpenChange={onClose}>
        <DialogContent>
          <div className="flex items-center justify-center p-8">
            Loading...
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  if (!scholarship) {
    return (
      <Dialog open={open} onOpenChange={onClose}>
        <DialogContent>
          <div className="text-center p-8">
            Scholarship not found
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {scholarship.title}
            <Badge variant={scholarship.status === "Approved" ? "default" : "outline"}>
              {scholarship.status}
            </Badge>
            {scholarship.featured && (
              <Badge variant="secondary">Featured</Badge>
            )}
          </DialogTitle>
        </DialogHeader>
        
        <ScrollArea className="max-h-[60vh]">
          <div className="space-y-6">
            {/* Basic Info */}
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="flex items-center gap-1">
                <DollarSign className="h-4 w-4" />
                {scholarship.amount.toLocaleString()} {scholarship.currency}
              </div>
              <div>
                <span className="font-medium">Awards:</span> {scholarship.number_of_awards}
              </div>
              <div>
                <span className="font-medium">Frequency:</span> {scholarship.award_frequency}
              </div>
              <div>
                <span className="font-medium">Renewable:</span> {scholarship.renewable ? 'Yes' : 'No'}
              </div>
              <div className="flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                Application Opens: {format(new Date(scholarship.application_open_date), 'MMM d, yyyy')}
              </div>
              <div className="flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                Deadline: {format(new Date(scholarship.application_deadline), 'MMM d, yyyy')}
              </div>
            </div>

            {/* Organization */}
            <div>
              <h3 className="font-semibold mb-2">Organization</h3>
              <div className="space-y-1">
                <p className="font-medium">{scholarship.organization_name}</p>
                {scholarship.organization_website && (
                  <a
                    href={scholarship.organization_website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-primary hover:underline text-sm"
                  >
                    Visit Website <ExternalLink className="h-3 w-3" />
                  </a>
                )}
              </div>
            </div>

            {/* Description */}
            <div>
              <h3 className="font-semibold mb-2">Description</h3>
              <p className="text-muted-foreground whitespace-pre-wrap">{scholarship.description}</p>
            </div>

            {/* Categories */}
            <div>
              <h3 className="font-semibold mb-2">Categories</h3>
              <div className="flex flex-wrap gap-2">
                {scholarship.category.map((cat, index) => (
                  <Badge key={index} variant="outline">
                    {cat}
                  </Badge>
                ))}
              </div>
            </div>

            {/* Eligibility Criteria */}
            <div>
              <h3 className="font-semibold mb-2">Eligibility Criteria</h3>
              <ul className="list-disc list-inside space-y-1 text-sm">
                {scholarship.eligibility_criteria.map((criteria, index) => (
                  <li key={index}>{criteria}</li>
                ))}
              </ul>
            </div>

            {/* Application Process */}
            <div>
              <h3 className="font-semibold mb-2">Application Process</h3>
              <p className="text-muted-foreground whitespace-pre-wrap">{scholarship.application_process}</p>
            </div>

            {/* Requirements */}
            {scholarship.essay_requirements && (
              <div>
                <h3 className="font-semibold mb-2">Essay Requirements</h3>
                <p className="text-muted-foreground">{scholarship.essay_requirements}</p>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="font-medium">Recommendation Letters:</span> {scholarship.recommendation_letters}
              </div>
              {scholarship.notification_date && (
                <div>
                  <span className="font-medium">Notification Date:</span>{' '}
                  {format(new Date(scholarship.notification_date), 'MMM d, yyyy')}
                </div>
              )}
            </div>

            {/* Special Requirements */}
            {scholarship.special_requirements && (
              <div>
                <h3 className="font-semibold mb-2">Special Requirements</h3>
                <p className="text-muted-foreground">{scholarship.special_requirements}</p>
              </div>
            )}

            {/* Contact Information */}
            <div>
              <h3 className="font-semibold mb-2">Contact Information</h3>
              <div className="space-y-2">
                {scholarship.contact_email && (
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4" />
                    <a
                      href={`mailto:${scholarship.contact_email}`}
                      className="text-primary hover:underline"
                    >
                      {scholarship.contact_email}
                    </a>
                  </div>
                )}
                {scholarship.contact_phone && (
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4" />
                    <a
                      href={`tel:${scholarship.contact_phone}`}
                      className="text-primary hover:underline"
                    >
                      {scholarship.contact_phone}
                    </a>
                  </div>
                )}
              </div>
            </div>

            {/* Application Link */}
            <div className="pt-4">
              <a
                href={scholarship.application_url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded hover:bg-primary/90 transition-colors"
              >
                Apply Now <ExternalLink className="h-4 w-4" />
              </a>
            </div>

            {/* Analytics */}
            <div className="grid grid-cols-3 gap-4 text-sm bg-muted/50 p-4 rounded-lg">
              <div className="text-center">
                <div className="font-medium">{scholarship.views_count}</div>
                <div className="text-muted-foreground">Views</div>
              </div>
              <div className="text-center">
                <div className="font-medium">{scholarship.bookmarks_count}</div>
                <div className="text-muted-foreground">Bookmarks</div>
              </div>
              <div className="text-center">
                <div className="font-medium">{scholarship.applications_count}</div>
                <div className="text-muted-foreground">Applications</div>
              </div>
            </div>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
