
import { useParams, useNavigate } from "react-router-dom";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useOpportunity } from "@/hooks/useOpportunity";
import { useAuthSession } from "@/hooks/useAuthSession";
import { ApplicationForm } from "@/components/opportunity/ApplicationForm";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { useBookmarkOpportunity } from "@/hooks/useBookmarkOpportunity";
import { motion } from "framer-motion";
import { OpportunityHeader } from "@/components/opportunity/OpportunityHeader";
import { OpportunityContent } from "@/components/opportunity/OpportunityContent";
import { OpportunitySidebar } from "@/components/opportunity/OpportunitySidebar";
import { OpportunityLoading } from "@/components/opportunity/OpportunityLoading";
import { OpportunityError } from "@/components/opportunity/OpportunityError";
import { useOpportunityShare } from "@/hooks/useOpportunityShare";
import { useExternalOpportunityClick } from "@/hooks/useExternalOpportunityClick";

export default function OpportunityDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: opportunity, isLoading, error } = useOpportunity(id as string);
  const { session } = useAuthSession();
  const [applyDialogOpen, setApplyDialogOpen] = useState(false);
  const { toast } = useToast();
  const { isBookmarked, toggleBookmark, isLoading: bookmarkLoading } = useBookmarkOpportunity(id);
  const { handleShare } = useOpportunityShare();
  const { clickLoading, handleExternalClick } = useExternalOpportunityClick(id, opportunity?.application_url);

  if (isLoading) {
    return (
      <div className="container px-4 py-8 mx-auto">
        <OpportunityLoading />
      </div>
    );
  }

  if (error || !opportunity) {
    return (
      <div className="container px-4 py-8 mx-auto">
        <OpportunityError navigate={navigate} />
      </div>
    );
  }

  const handleApply = () => {
    if (!session) {
      toast({
        title: "Authentication required",
        description: "Please sign in to apply for this opportunity",
        variant: "destructive",
      });
      navigate("/auth");
      return;
    }
    setApplyDialogOpen(true);
  };

  return (
    <div className="container px-4 py-8 mx-auto">
      <motion.div 
        initial={{ opacity: 0, y: 10 }} 
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="max-w-5xl mx-auto"
      >
        <Button 
          variant="ghost" 
          className="mb-6 flex items-center gap-1 group"
          onClick={() => navigate("/opportunities")}
        >
          <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
          <span>Back to Opportunities</span>
        </Button>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="md:col-span-2 space-y-6">
            <OpportunityHeader opportunity={opportunity} />
            <OpportunityContent opportunity={opportunity} />
          </div>

          <div className="md:col-span-1">
            <OpportunitySidebar 
              opportunity={opportunity}
              onApply={handleApply}
              onExternalClick={() => handleExternalClick(session)}
              onShare={() => handleShare(opportunity.title)}
              onToggleBookmark={toggleBookmark}
              isBookmarked={isBookmarked}
              bookmarkLoading={bookmarkLoading}
              clickLoading={clickLoading}
            />
          </div>
        </div>
      </motion.div>

      <Dialog open={applyDialogOpen} onOpenChange={setApplyDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <ApplicationForm 
            opportunityId={opportunity.id} 
            opportunityTitle={opportunity.title}
            onComplete={() => setApplyDialogOpen(false)} 
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}
