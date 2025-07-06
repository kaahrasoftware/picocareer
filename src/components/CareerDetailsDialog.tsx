
import React, { useEffect, useState } from 'react';
import {
  Dialog,
  DialogContent,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { supabase } from '@/integrations/supabase/client';
import { RecommendationCareerView } from '@/components/assessment/RecommendationCareerView';
import { SimilarCareersSection } from '@/components/assessment/SimilarCareersSection';
import { DialogContent as ComprehensiveDialogContent } from '@/components/career-details/DialogContent';
import { DialogHeaderSection } from '@/components/career-details/DialogHeaderSection';
import { useSimilarCareers } from '@/hooks/useSimilarCareers';
import { useToast } from '@/hooks/use-toast';
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
  const [isBookmarked, setIsBookmarked] = useState(false);
  const { toast } = useToast();

  // Determine if we should show recommendation data immediately
  const shouldShowRecommendation = !careerId || (careerNotFound && recommendationData);
  
  // Use similar careers hook when showing recommendation data
  const { similarCareers, isLoading: similarCareersLoading, error: similarCareersError } = useSimilarCareers(
    shouldShowRecommendation && recommendationData ? recommendationData.requiredSkills || [] : [],
    shouldShowRecommendation && recommendationData ? recommendationData.title : '',
    undefined // Don't pass industry since it's not available in CareerRecommendation
  );

  useEffect(() => {
    const fetchCareer = async () => {
      // If no careerId or we have recommendationData, skip database fetch
      if (!careerId || !open) {
        setCareer(null);
        setCareerNotFound(!careerId && !!recommendationData);
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
  }, [careerId, open, recommendationData]);

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

  const handleBookmarkToggle = () => {
    setIsBookmarked(!isBookmarked);
    toast({
      title: isBookmarked ? "Bookmark removed" : "Bookmark added",
      description: isBookmarked ? "Career removed from bookmarks" : "Career added to bookmarks",
    });
  };

  const handleShare = async () => {
    const shareUrl = `${window.location.origin}/career?dialog=true&careerId=${careerId}`;
    const shareText = `Check out this career: ${career ? career.title : recommendationData?.title || 'Career'}`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Share Career',
          text: shareText,
          url: shareUrl,
        });
      } catch (error) {
        if ((error as Error).name !== 'AbortError') {
          fallbackShare(shareText, shareUrl);
        }
      }
    } else {
      fallbackShare(shareText, shareUrl);
    }
  };

  const fallbackShare = (shareText: string, shareUrl: string) => {
    const fullText = `${shareText} ${shareUrl}`;
    navigator.clipboard.writeText(fullText);
    toast({
      title: "Link copied",
      description: "Career details copied to clipboard!",
    });
  };

  const getProfilesCount = () => {
    // For actual career data, we might have a profiles_count field
    // For recommendation data, we'll use a default or the field if available
    return career?.profiles_count || 0;
  };

  const getSalaryRange = () => {
    return career?.salary_range || recommendationData?.salaryRange;
  };

  const getTitle = () => {
    if (isLoading) return '';
    return career?.title || recommendationData?.title || 'Career Details';
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        {isLoading ? (
          <>
            <div className="p-4">
              <Skeleton className="h-8 w-[300px] mb-4" />
              <div className="flex gap-2 mb-4">
                <Skeleton className="h-6 w-20" />
                <Skeleton className="h-6 w-24" />
              </div>
            </div>
            <div className="space-y-4 p-4">
              <Skeleton className="h-[200px] w-full" />
              <div className="grid grid-cols-2 gap-4">
                <Skeleton className="h-[150px]" />
                <Skeleton className="h-[150px]" />
              </div>
            </div>
          </>
        ) : career ? (
          <>
            <DialogHeaderSection
              title={career.title}
              profilesCount={getProfilesCount()}
              salaryRange={getSalaryRange()}
              isBookmarked={isBookmarked}
              onBookmarkToggle={handleBookmarkToggle}
              onShare={handleShare}
              careerId={careerId}
            />
            <ComprehensiveDialogContent career={career} />
          </>
        ) : shouldShowRecommendation && recommendationData ? (
          <>
            <DialogHeaderSection
              title={recommendationData.title}
              profilesCount={getProfilesCount()}
              salaryRange={getSalaryRange()}
              isBookmarked={isBookmarked}
              onBookmarkToggle={handleBookmarkToggle}
              onShare={handleShare}
              careerId={careerId}
            />
            <div className="space-y-8">
              <RecommendationCareerView recommendation={recommendationData} />
              
              <SimilarCareersSection
                careers={similarCareers}
                isLoading={similarCareersLoading}
                error={similarCareersError}
                onCareerSelect={handleSimilarCareerSelect}
              />
            </div>
          </>
        ) : (
          <>
            <div className="p-4">
              <div className="flex justify-between items-center mb-4">
                <Skeleton className="h-8 w-[200px]" />
                <div className="flex gap-2">
                  <Skeleton className="h-9 w-9 rounded-full" />
                  <Skeleton className="h-9 w-9 rounded-full" />
                </div>
              </div>
            </div>
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
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
