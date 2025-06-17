
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { SessionsDataTable } from "./SessionsDataTable";
import { SessionMetricCards } from "./SessionMetricCards";
import { AdminSessionDetailsDialog } from "./AdminSessionDetailsDialog";
import { useAuth } from "@/context/AuthContext";

interface SessionParticipant {
  id: string;
  full_name: string;
  email: string;
}

interface SessionType {
  id: string;
  name: string;
  duration: number;
  price: number;
}

interface MentorSession {
  id: string;
  status: string;
  scheduled_at: string;
  notes: string;
  meeting_link: string;
  meeting_platform: "WhatsApp" | "Google Meet" | "Telegram" | "Phone Call";
  mentor: SessionParticipant;
  mentee: SessionParticipant;
  session_type: SessionType;
}

export function SessionManagementTab() {
  const { user } = useAuth();
  const [selectedSession, setSelectedSession] = useState<MentorSession | null>(null);
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);

  const { data: sessions = [], isLoading, refetch } = useQuery({
    queryKey: ['admin-sessions', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];

      const { data, error } = await supabase
        .from('mentor_sessions')
        .select(`
          id,
          status,
          scheduled_at,
          notes,
          meeting_link,
          meeting_platform,
          mentor:mentor_id(id, full_name, email),
          mentee:mentee_id(id, full_name, email),
          session_type:session_types(id, name, duration, price)
        `)
        .order('scheduled_at', { ascending: false });

      if (error) {
        console.error('Error fetching sessions:', error);
        throw error;
      }

      // Transform the data to match our interface
      const transformedSessions: MentorSession[] = (data || []).map(session => ({
        id: session.id,
        status: session.status,
        scheduled_at: session.scheduled_at,
        notes: session.notes,
        meeting_link: session.meeting_link,
        meeting_platform: session.meeting_platform,
        mentor: {
          id: session.mentor?.id || '',
          full_name: session.mentor?.full_name || '',
          email: session.mentor?.email || '',
        },
        mentee: {
          id: session.mentee?.id || '',
          full_name: session.mentee?.full_name || '',
          email: session.mentee?.email || '',
        },
        session_type: {
          id: session.session_type?.id || '',
          name: session.session_type?.name || '',
          duration: session.session_type?.duration || 0,
          price: session.session_type?.price || 0,
        },
      }));

      return transformedSessions;
    },
    enabled: !!user?.id
  });

  const handleViewSession = (session: MentorSession) => {
    setSelectedSession(session);
    setDetailsDialogOpen(true);
  };

  const handleCloseDetails = () => {
    setDetailsDialogOpen(false);
    setSelectedSession(null);
  };

  if (isLoading) {
    return <div className="flex items-center justify-center p-8">Loading sessions...</div>;
  }

  return (
    <div className="space-y-6">
      <SessionMetricCards sessions={sessions} />
      
      <div>
        <h3 className="text-lg font-semibold mb-4">All Sessions</h3>
        <SessionsDataTable 
          sessions={sessions} 
          onViewSession={handleViewSession}
          onRefresh={refetch}
        />
      </div>

      {selectedSession && (
        <AdminSessionDetailsDialog
          open={detailsDialogOpen}
          onClose={handleCloseDetails}
          session={selectedSession}
        />
      )}
    </div>
  );
}
