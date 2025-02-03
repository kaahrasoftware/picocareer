import {
  Dialog,
  DialogContent,
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

interface CareerDetailsDialogProps {
  careerId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

type CareerWithMajors = Tables<"careers"> & {
  career_major_relations: {
    major: {
      title: string;
      id: string;
    };
  }[];
};

export function CareerDetailsDialog({ careerId, open, onOpenChange }: CareerDetailsDialogProps) {
  const queryClient = useQueryClient();
  const { session } = useAuthSession();
  const [isBookmarked, setIsBookmarked] = useState(false);

  const { data: career, isLoading } = useQuery({
    queryKey: ['career', careerId],
    queryFn: async () => {
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

      if (error) throw error;
      return data as CareerWithMajors;
    },
    enabled: open && !!careerId,
  });

  // Check if the career is bookmarked
  useQuery({
    queryKey: ['career-bookmark', careerId, session?.user?.id],
    queryFn: async () => {
      if (!session?.user?.id) return null;
      
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
    enabled: open && !!careerId && !!session?.user?.id,
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
    const shareText = `Check out this career: ${career?.title}\n\nSalary Range: ${career?.salary_range || 'Not specified'}\n\n${career?.description}\n\nLearn more at:`;
    const imageUrl = career?.image_url || '';

    // Add meta tags for social media preview
    const metaTags = document.createElement('div');
    metaTags.innerHTML = `
      <meta property="og:title" content="${career?.title || ''}" />
      <meta property="og:description" content="${career?.description || ''}" />
      <meta property="og:image" content="${imageUrl}" />
      <meta property="og:url" content="${shareUrl}" />
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:image" content="${imageUrl}" />
    `;
    document.head.appendChild(metaTags);

    if (navigator.share) {
      try {
        await navigator.share({
          title: career?.title || 'Career Details',
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

  useEffect(() => {
    if (!open || !careerId) return;

    const channel = supabase
      .channel('career-updates')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'careers',
          filter: `id=eq.${careerId}`,
        },
        (payload) => {
          console.log('Received real-time update:', payload);
          queryClient.setQueryData(['career', careerId], (oldData: CareerWithMajors | undefined) => {
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
  }, [careerId, open, queryClient]);

  if (!open) return null;
  if (isLoading) return <div>Loading...</div>;
  if (!career) return <div>Career not found</div>;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/95 p-0">
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