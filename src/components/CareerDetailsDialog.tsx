
import React, { useEffect, useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { supabase } from '@/integrations/supabase/client';
import { RecommendationCareerView } from '@/components/assessment/RecommendationCareerView';
import { SimilarCareersSection } from '@/components/assessment/SimilarCareersSection';
import { DialogContent as ComprehensiveDialogContent } from '@/components/career-details/DialogContent';
import { useSimilarCareers } from '@/hooks/useSimilarCareers';
import type { CareerRecommendation } from '@/types/assessment';
import type { Tables } from '@/integrations/supabase/types';

type CareerWithMajors = Tables<"careers"> & {
  career_major_relations: {
    major: {
      title: string;
      id: string;
    };
  }[];
};

interface CareerDetailsDialogProps {
  careerId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  recommendationData?: CareerRecommendation;
}

export function CareerDetailsDialog({
  careerId,
  open,
  onOpenChange,
  recommendationData
}: CareerDetailsDialogProps) {
  const [career, setCareer] = useState<CareerWithMajors | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [careerNotFound, setCareerNotFound] = useState(false);

  // Use similar careers hook when career is not found
  const { similarCareers, isLoading: similarCareersLoading, error: similarCareersError } = useSimilarCareers(
    careerNotFound && recommendationData ? recommendationData.requiredSkills || [] : [],
    careerNotFound && recommendationData ? recommendationData.title : '',
    undefined // Don't pass industry since it's not available in CareerRecommendation
  );

  useEffect(() => {
    const fetchCareer = async () => {
      if (!careerId || !open) {
        setCareer(null);
        setCareerNotFound(false);
        return;
      }

      setIsLoading(true);
      setCareerNotFound(false);
      
      try {
        const { data, error } = await supabase
          .from('careers')
          .select(`
            *,
            career_major_relations (
              major: majors (
                title,
                id
              )
            )
          `)
          .eq('id', careerId)
          .eq('status', 'Approved')
          .single();

        if (error || !data) {
          setCareerNotFound(true);
          setCareer(null);
        } else {
          setCareer(data);
          setCareerNotFound(false);
        }
      } catch (err) {
        console.error('Error fetching career:', err);
        setCareerNotFound(true);
        setCareer(null);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCareer();
  }, [careerId, open]);

  const handleSimilarCareerSelect = (selectedCareerId: string) => {
    // Replace current dialog content with the selected career
    setCareer(null);
    setCareerNotFound(false);
    setIsLoading(true);
    
    // Fetch the selected career details with relations
    supabase
      .from('careers')
      .select(`
        *,
        career_major_relations (
          major: majors (
            title,
            id
          )
        )
      `)
      .eq('id', selectedCareerId)
      .eq('status', 'Approved')
      .single()
      .then(({ data, error }) => {
        if (error || !data) {
          console.error('Error fetching selected career:', error);
        } else {
          setCareer(data);
        }
        setIsLoading(false);
      });
  };

  const handleClose = () => {
    onOpenChange(false);
    // Reset state when closing
    setTimeout(() => {
      setCareer(null);
      setCareerNotFound(false);
    }, 200);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {isLoading ? (
              <Skeleton className="h-8 w-[300px]" />
            ) : career ? (
              career.title
            ) : recommendationData ? (
              recommendationData.title
            ) : (
              'Career Details'
            )}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {isLoading ? (
            <div className="space-y-4">
              <Skeleton className="h-[200px] w-full" />
              <div className="grid grid-cols-2 gap-4">
                <Skeleton className="h-[150px]" />
                <Skeleton className="h-[150px]" />
              </div>
            </div>
          ) : career ? (
            // Use the comprehensive DialogContent component
            <ComprehensiveDialogContent career={career} />
          ) : careerNotFound && recommendationData ? (
            // Display recommendation data with similar careers
            <div className="space-y-8">
              <RecommendationCareerView recommendation={recommendationData} />
              
              <SimilarCareersSection
                careers={similarCareers}
                isLoading={similarCareersLoading}
                error={similarCareersError}
                onCareerSelect={handleSimilarCareerSelect}
              />
            </div>
          ) : (
            // Fallback for when no data is available
            <div className="text-center py-8">
              <p className="text-muted-foreground">Career information not available.</p>
              <Button 
                variant="outline" 
                onClick={handleClose}
                className="mt-4"
              >
                Close
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
