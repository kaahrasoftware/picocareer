import {
  Dialog,
  DialogContent,
  DialogClose,
} from "@/components/ui/dialog";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";
import { useEffect, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useAuthSession } from "@/hooks/useAuthSession";
import { toast } from "sonner";
import { DialogHeaderSection } from "./career-details/DialogHeaderSection";
import { DialogContent as CareerDialogContent } from "./career-details/DialogContent";
import { RecommendationCareerView } from "./assessment/RecommendationCareerView";
import { SimilarCareersSection } from "./assessment/SimilarCareersSection";
import { useSimilarCareers } from "@/hooks/useSimilarCareers";
import { useNavigate } from "react-router-dom";
import { X } from "lucide-react";
import type { CareerRecommendation } from "@/types/assessment";

interface CareerDetailsDialogProps {
  careerId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  recommendationData?: CareerRecommendation;
}

type CareerWithMajors = Tables<"careers"> & {
  career_major_relations: {
    major: {
      title: string;
      id: string;
    };
  }[];
};

export function CareerDetailsDialog({ 
  careerId, 
  open, 
  onOpenChange, 
  recommendationData 
}: CareerDetailsDialogProps) {
  const queryClient = useQueryClient();
  const { session } = useAuthSession();
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [selectedSimilarCareerId, setSelectedSimilarCareerId] = useState<string | null>(null);
  const navigate = useNavigate();

  const { data: career, isLoading, error } = useQuery({
    queryKey: ['career', careerId],
    queryFn: async () => {
      if (!careerId) return null;
      
      const { data, error } = await supabase
        .from('careers')
        .select(`
          *,
          career_major_relations(
            major:majors(id, title)
          )
        `)
        .eq('id', careerId)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          // Career not found
          return null;
        }
        throw error;
      }
      return data as CareerWithMajors;
    },
    enabled: open && !!careerId,
  });

  // Find similar careers when the main career doesn't exist and we have recommendation data
  const {
    similarCareers,
    isLoading: similarCareersLoading,
    error: similarCareersError
  } = useSimilarCareers(
    !career && recommendationData ? recommendationData.requiredSkills || [] : [],
    !career && recommendationData ? recommendationData.title : '',
    !career && recommendationData ? recommendationData.industry : undefined
  );

  // Check if the career is bookmarked
  useQuery({
    queryKey: ['career-bookmark', careerId, session?.user?.id],
    queryFn: async () => {
      if (!session?.user?.id || !careerId || !career) return null;
      
      const { data, error } = await supabase
        .from('user_bookmarks')
        .select('id')
        .eq('profile_id', session.user.id)
        .eq('content_id', careerId)
        .eq('content_type', 'career')
        .maybeSingle();

      if (error && error.code !== 'PGRST116') throw error;
      setIsBookmarked(!!data);
      return data;
    },
    enabled: open && !!careerId && !!session?.user?.id && !!career,
  });

  const handleBookmarkToggle = async () => {
    if (!session?.user?.id) {
      toast.error("Please sign in to bookmark careers");
      return;
    }

    try {
      if (isBookmarked) {
        const { error } = await supabase
          .from('user_bookmarks')
          .delete()
          .eq('profile_id', session.user.id)
          .eq('content_id', careerId)
          .eq('content_type', 'career');

        if (error) throw error;
        setIsBookmarked(false);
        toast.success("Career removed from bookmarks");
      } else {
        const { error } = await supabase
          .from('user_bookmarks')
          .insert({
            profile_id: session.user.id,
            content_id: careerId,
            content_type: 'career'
          });

        if (error) throw error;
        setIsBookmarked(true);
        toast.success("Career added to bookmarks");
      }
    } catch (error) {
      console.error('Error toggling bookmark:', error);
      toast.error("Failed to update bookmark");
    }
  };

  const handleShare = async () => {
    const shareUrl = `${window.location.origin}/career?dialog=true&careerId=${careerId}`;
    const shareText = `Check out this career: ${career?.title || recommendationData?.title}\n\nSalary Range: ${career?.salary_range || recommendationData?.salaryRange || 'Not specified'}\n\n${career?.description || recommendationData?.description}\n\nLearn more at:`;
    
    // Ensure image URL is absolute
    const imageUrl = career?.image_url ? 
      (career.image_url.startsWith('http') ? career.image_url : `${window.location.origin}${career.image_url}`) 
      : '';

    // Add meta tags for social media preview
    const metaTags = document.createElement('div');
    metaTags.innerHTML = `
      <meta property="og:title" content="${career?.title || recommendationData?.title || ''}" />
      <meta property="og:description" content="${(career?.description || recommendationData?.description || '').substring(0, 200)}" />
      <meta property="og:image" content="${imageUrl}" />
      <meta property="og:url" content="${shareUrl}" />
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:image" content="${imageUrl}" />
    `;
    document.head.appendChild(metaTags);

    if (navigator.share) {
      try {
        await navigator.share({
          title: career?.title || recommendationData?.title || 'Career Details',
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

    // Clean up meta tags after sharing
    setTimeout(() => {
      document.head.removeChild(metaTags);
    }, 1000);
  };

  const fallbackShare = (shareText: string, shareUrl: string) => {
    const fullText = `${shareText} ${shareUrl}`;
    navigator.clipboard.writeText(fullText);
    toast.success("Career details copied to clipboard!");
  };

  const handleCloseDialog = () => {
    setSelectedSimilarCareerId(null);
    onOpenChange(false);
    
    // Update the URL by removing the dialog and careerId params
    const currentPath = window.location.pathname;
    navigate(currentPath, { replace: true });
  };

  const handleSimilarCareerSelect = (similarCareerId: string) => {
    setSelectedSimilarCareerId(similarCareerId);
  };

  useEffect(() => {
    if (!open || !career?.id) return;

    const channel = supabase
      .channel('career-updates')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'careers',
          filter: `id=eq.${career.id}`,
        },
        (payload) => {
          console.log('Received real-time update:', payload);
          queryClient.setQueryData(['career', career.id], (oldData: CareerWithMajors | undefined) => {
            if (!oldData) return oldData;
            return {
              ...oldData,
              ...payload.new,
            };
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [career?.id, open, queryClient]);

  if (!open) return null;

  // Show loading state
  if (isLoading) {
    return (
      <Dialog open={open} onOpenChange={handleCloseDialog}>
        <DialogContent className="max-w-4xl max-h-[90vh] bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/95 p-0">
          <DialogClose className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground">
            <X className="h-4 w-4" />
            <span className="sr-only">Close</span>
          </DialogClose>
          <div className="flex items-center justify-center py-8">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
              <p>Loading career details...</p>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  // If we have a similar career selected, show that career instead
  if (selectedSimilarCareerId) {
    return (
      <CareerDetailsDialog
        careerId={selectedSimilarCareerId}
        open={open}
        onOpenChange={handleCloseDialog}
      />
    );
  }

  // Show existing career details if found
  if (career) {
    return (
      <Dialog open={open} onOpenChange={handleCloseDialog}>
        <DialogContent className="max-w-4xl max-h-[90vh] bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/95 p-0">
          <DialogClose className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground">
            <X className="h-4 w-4" />
            <span className="sr-only">Close</span>
          </DialogClose>
          <DialogHeaderSection
            title={career.title}
            profilesCount={career.profiles_count || 0}
            salaryRange={career.salary_range}
            isBookmarked={isBookmarked}
            onBookmarkToggle={handleBookmarkToggle}
            onShare={handleShare}
            careerId={careerId}
          />
          <CareerDialogContent career={career} />
        </DialogContent>
      </Dialog>
    );
  }

  // Show recommendation view with similar careers if career not found
  if (!career && recommendationData) {
    return (
      <Dialog open={open} onOpenChange={handleCloseDialog}>
        <DialogContent className="max-w-4xl max-h-[90vh] bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/95 p-0">
          <DialogClose className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground">
            <X className="h-4 w-4" />
            <span className="sr-only">Close</span>
          </DialogClose>
          
          <div className="p-6 space-y-6 max-h-[85vh] overflow-y-auto">
            <RecommendationCareerView recommendation={recommendationData} />
            
            <SimilarCareersSection
              careers={similarCareers}
              isLoading={similarCareersLoading}
              error={similarCareersError}
              onCareerSelect={handleSimilarCareerSelect}
            />
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  // Fallback for when no career or recommendation data is available
  return (
    <Dialog open={open} onOpenChange={handleCloseDialog}>
      <DialogContent className="max-w-4xl max-h-[90vh] bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/95 p-0">
        <DialogClose className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground">
          <X className="h-4 w-4" />
          <span className="sr-only">Close</span>
        </DialogClose>
        <div className="flex items-center justify-center py-8">
          <div className="text-center">
            <p className="text-lg font-semibold mb-2">Career Not Found</p>
            <p className="text-muted-foreground">
              This career information is not available in our database.
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
