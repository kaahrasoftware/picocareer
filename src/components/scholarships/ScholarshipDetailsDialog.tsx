
import { formatDistanceToNow } from "date-fns";
import { CalendarIcon, Award, ArrowUpRight, Copy, ExternalLink } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";

interface ScholarshipDetailsDialogProps {
  scholarship: {
    id: string;
    title: string;
    description: string;
    provider_name: string;
    amount: number | null;
    deadline: string | null;
    status: string;
    application_url: string | null;
    category: string[];
    tags: string[];
    featured: boolean;
    eligibility_criteria?: {
      gpa_requirement?: string;
      academic_year?: string[];
      citizenship?: string[];
      demographic?: string[];
      major?: string[];
      other?: string;
    };
    application_process?: string;
    award_frequency?: string;
    contact_email?: string;
    award_date?: string;
  };
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ScholarshipDetailsDialog({
  scholarship,
  open,
  onOpenChange,
}: ScholarshipDetailsDialogProps) {
  const { toast } = useToast();
  const [isBookmarked, setIsBookmarked] = useState(false);

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.origin + "/scholarship/" + scholarship.id);
    toast({
      title: "Link copied",
      description: "Scholarship link copied to clipboard",
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[85vh] p-0">
        <ScrollArea className="max-h-[85vh]">
          <DialogHeader className="p-6 pb-3">
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <DialogTitle className="text-2xl">{scholarship.title}</DialogTitle>
                  {scholarship.featured && (
                    <Badge className="bg-amber-500 hover:bg-amber-600">Featured</Badge>
                  )}
                  {scholarship.status !== "Active" && (
                    <Badge variant={scholarship.status === "Coming Soon" ? "outline" : "secondary"}>
                      {scholarship.status}
                    </Badge>
                  )}
                </div>
                <DialogDescription className="mt-1 text-base">
                  {scholarship.provider_name}
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          <div className="px-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-y-2 gap-x-4 mb-6">
              <div className="flex items-center">
                <Award className="h-4 w-4 mr-2 text-blue-600" />
                <span className="font-medium">
                  {scholarship.amount
                    ? `$${scholarship.amount.toLocaleString()}`
                    : "Amount varies"}
                </span>
              </div>

              {scholarship.deadline && (
                <div className="flex items-center">
                  <CalendarIcon className="h-4 w-4 mr-2 text-red-600" />
                  <span>
                    {new Date(scholarship.deadline) > new Date()
                      ? `Deadline: ${new Date(scholarship.deadline).toLocaleDateString()}`
                      : "Deadline passed"}
                  </span>
                </div>
              )}

              {scholarship.award_frequency && (
                <div className="flex items-center">
                  <CalendarIcon className="h-4 w-4 mr-2 text-green-600" />
                  <span>Award Frequency: {scholarship.award_frequency}</span>
                </div>
              )}

              {scholarship.award_date && (
                <div className="flex items-center">
                  <CalendarIcon className="h-4 w-4 mr-2 text-purple-600" />
                  <span>Award Date: {new Date(scholarship.award_date).toLocaleDateString()}</span>
                </div>
              )}
            </div>
          </div>

          <Separator />

          <div className="p-6">
            <h3 className="text-lg font-medium mb-3">Description</h3>
            <div className="prose max-w-none" dangerouslySetInnerHTML={{ __html: scholarship.description || "" }} />

            {scholarship.eligibility_criteria && (
              <>
                <h3 className="text-lg font-medium mt-6 mb-3">Eligibility Criteria</h3>
                <ul className="list-disc pl-5 space-y-2">
                  {scholarship.eligibility_criteria.gpa_requirement && (
                    <li>
                      <span className="font-medium">GPA Requirement:</span> {scholarship.eligibility_criteria.gpa_requirement}
                    </li>
                  )}
                  {scholarship.eligibility_criteria.academic_year?.length > 0 && (
                    <li>
                      <span className="font-medium">Academic Year:</span>{" "}
                      {scholarship.eligibility_criteria.academic_year.join(", ")}
                    </li>
                  )}
                  {scholarship.eligibility_criteria.major?.length > 0 && (
                    <li>
                      <span className="font-medium">Fields of Study:</span>{" "}
                      {scholarship.eligibility_criteria.major.join(", ")}
                    </li>
                  )}
                  {scholarship.eligibility_criteria.citizenship?.length > 0 && (
                    <li>
                      <span className="font-medium">Citizenship Requirements:</span>{" "}
                      {scholarship.eligibility_criteria.citizenship.join(", ")}
                    </li>
                  )}
                  {scholarship.eligibility_criteria.demographic?.length > 0 && (
                    <li>
                      <span className="font-medium">Demographic Requirements:</span>{" "}
                      {scholarship.eligibility_criteria.demographic.join(", ")}
                    </li>
                  )}
                  {scholarship.eligibility_criteria.other && (
                    <li>
                      <span className="font-medium">Other Requirements:</span>
                      <div dangerouslySetInnerHTML={{ __html: scholarship.eligibility_criteria.other }} />
                    </li>
                  )}
                </ul>
              </>
            )}

            {scholarship.application_process && (
              <>
                <h3 className="text-lg font-medium mt-6 mb-3">Application Process</h3>
                <div className="prose max-w-none" dangerouslySetInnerHTML={{ __html: scholarship.application_process }} />
              </>
            )}

            <div className="flex flex-wrap gap-2 mt-6">
              {scholarship.category?.map((cat) => (
                <Badge key={cat} variant="outline" className="bg-blue-50">
                  {cat}
                </Badge>
              ))}
              {scholarship.tags?.map((tag) => (
                <Badge key={tag} variant="secondary" className="bg-gray-100 text-gray-800">
                  {tag}
                </Badge>
              ))}
            </div>

            {scholarship.contact_email && (
              <div className="mt-6">
                <h3 className="text-md font-medium">Contact Information</h3>
                <p className="text-sm mt-1">{scholarship.contact_email}</p>
              </div>
            )}
          </div>

          <DialogFooter className="p-6 pt-2 flex flex-col sm:flex-row gap-2">
            <Button variant="outline" size="sm" onClick={handleCopyLink}>
              <Copy className="h-4 w-4 mr-1" /> Share
            </Button>

            {scholarship.application_url && (
              <Button size="sm" asChild>
                <a href={scholarship.application_url} target="_blank" rel="noopener noreferrer">
                  Apply <ExternalLink className="h-4 w-4 ml-1" />
                </a>
              </Button>
            )}
          </DialogFooter>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
