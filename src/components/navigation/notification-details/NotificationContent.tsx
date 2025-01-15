import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { ExternalLink } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import type { MentorSession } from "@/types/calendar";
import { useToast } from "@/hooks/use-toast";
import { CareerDetailsDialog } from "@/components/CareerDetailsDialog";
import { MajorDetails } from "@/components/MajorDetails";
import { BlogPostDialog } from "@/components/blog/BlogPostDialog";
import { useQuery } from "@tanstack/react-query";
import type { Major } from "@/types/database/majors";
import type { BlogWithAuthor } from "@/types/blog/types";
import type { Tables } from "@/integrations/supabase/types";

interface NotificationContentProps {
  message: string;
  isExpanded: boolean;
  type?: string;
  action_url?: string;
}

type CareerWithMajors = Tables<"careers"> & {
  career_major_relations: {
    major: {
      title: string;
      id: string;
    };
  }[];
};

export function NotificationContent({ message, isExpanded, type, action_url }: NotificationContentProps) {
  const [sessionData, setSessionData] = useState<MentorSession | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const { toast } = useToast();
  
  // Extract ID from action URL
  const contentId = action_url?.split('/').pop();

  // Fetch major data if needed
  const { data: majorData } = useQuery({
    queryKey: ['major', contentId],
    queryFn: async () => {
      if (!contentId || type !== 'major_update') return null;
      const { data, error } = await supabase
        .from('majors')
        .select('*')
        .eq('id', contentId)
        .single();
      
      if (error) throw error;
      return data as Major;
    },
    enabled: !!contentId && type === 'major_update' && dialogOpen,
  });

  // Fetch career data if needed
  const { data: careerData } = useQuery({
    queryKey: ['career', contentId],
    queryFn: async () => {
      if (!contentId || type !== 'career_update') return null;
      const { data, error } = await supabase
        .from('careers')
        .select(`
          *,
          career_major_relations(
            major:majors(id, title)
          )
        `)
        .eq('id', contentId)
        .single();
      
      if (error) throw error;
      return data as CareerWithMajors;
    },
    enabled: !!contentId && type === 'career_update' && dialogOpen,
  });

  // Fetch blog data if needed
  const { data: blogData } = useQuery({
    queryKey: ['blog', contentId],
    queryFn: async () => {
      if (!contentId || type !== 'blog_update') return null;
      const { data, error } = await supabase
        .from('blogs')
        .select(`
          *,
          profiles:author_id (
            full_name,
            avatar_url
          )
        `)
        .eq('id', contentId)
        .single();
      
      if (error) throw error;
      return data as BlogWithAuthor;
    },
    enabled: !!contentId && type === 'blog_update' && dialogOpen,
  });

  useEffect(() => {
    const fetchSessionData = async () => {
      if (!isExpanded) return;
      
      const meetingLinkMatch = message.match(/href="([^"]+)"/);
      if (meetingLinkMatch) {
        const { data, error } = await supabase
          .from('mentor_sessions')
          .select(`
            id,
            scheduled_at,
            notes,
            meeting_platform,
            meeting_link,
            session_type:mentor_session_types(type, duration),
            mentor:profiles!mentor_sessions_mentor_id_fkey(full_name),
            mentee:profiles!mentor_sessions_mentee_id_fkey(full_name)
          `)
          .eq('meeting_link', meetingLinkMatch[1])
          .maybeSingle();

        if (error) {
          console.error('Error fetching session data:', error);
          throw error;
        }

        if (data) {
          setSessionData(data as MentorSession);
        }
      }
    };

    fetchSessionData();
  }, [isExpanded, message, toast]);

  if (!isExpanded) {
    return (
      <p className="text-sm text-zinc-400 mt-1 line-clamp-2">
        {message.split(/[.!?]/)[0]}
      </p>
    );
  }

  const handleActionClick = () => {
    if (!action_url || !contentId) return;
    setDialogOpen(true);
  };

  const renderDialog = () => {
    if (!action_url || !dialogOpen || !contentId) return null;

    switch (type) {
      case "major_update":
        if (!majorData) return null;
        return (
          <MajorDetails
            major={majorData}
            open={dialogOpen}
            onOpenChange={setDialogOpen}
          />
        );
      case "career_update":
        if (!careerData) return null;
        return (
          <CareerDetailsDialog
            careerId={contentId}
            open={dialogOpen}
            onOpenChange={setDialogOpen}
          />
        );
      case "blog_update":
        if (!blogData) return null;
        return (
          <BlogPostDialog
            blog={blogData}
            isOpen={dialogOpen}
            onClose={() => setDialogOpen(false)}
          />
        );
      default:
        return null;
    }
  };

  const renderActionButton = () => {
    if (!action_url) return null;

    let buttonText = "View Details";
    if (type === "major_update") buttonText = "View Major";
    if (type === "career_update") buttonText = "View Career";
    if (type === "blog_update") buttonText = "View Blog Post";

    return (
      <Button
        variant="outline"
        size="sm"
        className="mt-2 text-sky-400 hover:text-sky-300 hover:bg-sky-400/10"
        onClick={handleActionClick}
      >
        {buttonText}
        <ExternalLink className="w-4 h-4 ml-2" />
      </Button>
    );
  };

  if (!sessionData) {
    return (
      <div className="space-y-2 mt-3 text-sm text-zinc-400">
        <p>{message}</p>
        {renderActionButton()}
        {renderDialog()}
      </div>
    );
  }

  return (
    <div className="space-y-2 mt-3 text-sm text-zinc-400">
      <p><span className="font-medium text-zinc-300">Mentor:</span> {sessionData.mentor?.full_name}</p>
      <p><span className="font-medium text-zinc-300">Mentee:</span> {sessionData.mentee?.full_name}</p>
      <p><span className="font-medium text-zinc-300">Start Time:</span> {new Date(sessionData.scheduled_at).toLocaleString()}</p>
      <p><span className="font-medium text-zinc-300">Session Type:</span> {sessionData.session_type?.type}</p>
      <p><span className="font-medium text-zinc-300">Duration:</span> {sessionData.session_type?.duration} minutes</p>
      <p><span className="font-medium text-zinc-300">Platform:</span> {sessionData.meeting_platform}</p>
      {sessionData.meeting_link && (
        <p>
          <span className="font-medium text-zinc-300">Meeting Link:</span>{' '}
          <a 
            href={sessionData.meeting_link} 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-sky-400 hover:text-sky-300 hover:underline"
          >
            Join Meeting
          </a>
        </p>
      )}
      {sessionData.notes && (
        <p><span className="font-medium text-zinc-300">Note:</span> {sessionData.notes}</p>
      )}
      {renderActionButton()}
      {renderDialog()}
    </div>
  );
}