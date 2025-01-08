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
        />
        <CareerDialogContent career={career} />
      </DialogContent>
    </Dialog>
  );
}