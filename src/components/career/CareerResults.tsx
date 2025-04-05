
import { CareerCard } from "@/components/CareerCard";
import { SkeletonCard } from "@/components/ui/skeleton-card";
import type { Tables } from "@/integrations/supabase/types";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { SkeletonGrid } from "@/components/ui/skeleton-grid";

interface CareerResultsProps {
  filteredCareers: Tables<"careers">[];
  isLoading?: boolean;
}

export const CareerResults = ({ filteredCareers, isLoading }: CareerResultsProps) => {
  const navigate = useNavigate();
  
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

  const handleCareerClick = (careerId: string) => {
    navigate(`/career?dialog=true&careerId=${careerId}`);
  };

  if (isLoading) {
    return <SkeletonGrid itemCount={6} columns={3} />;
  }

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
            <CareerCard 
              id={career.id}
              title={career.title}
              description={career.description}
              salary_range={career.salary_range}
              requiredSkills={career.required_skills}
              industry={career.industry}
              required_education={career.required_education}
              transferable_skills={career.transferable_skills}
              profiles_count={career.profiles_count}
              onClick={() => handleCareerClick(career.id)}
            />
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
