
import { OpportunityWithAuthor } from "@/types/opportunity/types";
import { OpportunityCard } from "./OpportunityCard";
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { motion } from "framer-motion";

interface OpportunityGridProps {
  opportunities: OpportunityWithAuthor[];
  isLoading: boolean;
  error: Error | null;
  onRetry?: () => void;
}

export function OpportunityGrid({ 
  opportunities, 
  isLoading, 
  error, 
  onRetry 
}: OpportunityGridProps) {
  // Animation variants
  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="border rounded-lg p-5 space-y-4">
            <div className="flex justify-between">
              <Skeleton className="h-6 w-24" />
              <Skeleton className="h-4 w-16" />
            </div>
            <Skeleton className="h-7 w-3/4" />
            <Skeleton className="h-5 w-1/2" />
            <Skeleton className="h-20 w-full" />
            <div className="flex gap-2">
              <Skeleton className="h-6 w-20" />
              <Skeleton className="h-6 w-20" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12 border border-dashed rounded-lg">
        <p className="text-destructive mb-4">
          Error loading opportunities: {error.message}
        </p>
        <Button variant="outline" onClick={onRetry} className="gap-2">
          <RefreshCw className="h-4 w-4" />
          Retry
        </Button>
      </div>
    );
  }

  if (opportunities.length === 0) {
    return (
      <motion.div 
        className="text-center py-12 border border-dashed rounded-lg bg-muted/30"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <h3 className="text-lg font-medium mb-2">No opportunities found</h3>
        <p className="text-muted-foreground mb-4">
          Try adjusting your filters or check back later for new opportunities.
        </p>
      </motion.div>
    );
  }

  return (
    <motion.div 
      className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
      variants={container}
      initial="hidden"
      animate="show"
    >
      {opportunities.map((opportunity) => (
        <motion.div key={opportunity.id} variants={item}>
          <OpportunityCard opportunity={opportunity} />
        </motion.div>
      ))}
    </motion.div>
  );
}
