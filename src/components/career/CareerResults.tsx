import { CareerCard } from "@/components/CareerCard";
import type { Tables } from "@/integrations/supabase/types";
import { motion } from "framer-motion";

interface CareerResultsProps {
  filteredCareers: Tables<"careers">[];
}

export const CareerResults = ({ filteredCareers }: CareerResultsProps) => {
  // Filter for complete careers only
  const completeCareers = filteredCareers.filter(career => career.complete_career);

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

  return (
    <>
      <motion.div 
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        variants={container}
        initial="hidden"
        animate="show"
      >
        {completeCareers.map((career) => (
          <motion.div key={career.id} variants={item}>
            <CareerCard {...career} />
          </motion.div>
        ))}
      </motion.div>
      
      {completeCareers.length === 0 && (
        <motion.div 
          className="text-center py-12 bg-muted/50 rounded-lg"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <h3 className="text-lg font-medium text-muted-foreground mb-2">
            No careers found
          </h3>
          <p className="text-sm text-muted-foreground">
            Try adjusting your filters or search terms
          </p>
        </motion.div>
      )}
    </>
  );
};