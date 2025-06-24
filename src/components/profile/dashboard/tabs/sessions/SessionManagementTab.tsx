import React from 'react';
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { SessionTable } from "./SessionTable";
import { SessionFilters } from "./SessionFilters";
import { useSearchParams } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

export function SessionManagementTab() {
  const [searchParams, setSearchParams] = useSearchParams();

  // Get the profile of the current user
  const { data: profile } = useQuery({
    queryKey: ['user-profile'],
    queryFn: async () => {
      const { data, error } = await supabase.auth.getUser();

      if (error) {
        console.error('Error fetching user:', error);
        throw error;
      }

      if (!data.user) {
        console.error('No user found');
        return null;
      }

      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', data.user.id)
        .single();

      if (profileError) {
        console.error('Error fetching profile:', profileError);
        throw profileError;
      }

      return profileData;
    },
  });

  // Fetch sessions for the current mentor/mentee
  const { data: sessions = [], isLoading, refetch } = useQuery({
    queryKey: ['mentor-sessions', profile?.id],
    queryFn: async () => {
      if (!profile?.id) return [];

      const { data, error } = await supabase
        .from('mentor_sessions')
        .select(`
          id,
          status,
          scheduled_at,
          notes,
          meeting_link,
          meeting_platform,
          mentor:profiles!mentor_sessions_mentor_id_fkey(
            id,
            full_name,
            avatar_url
          ),
          mentee:profiles!mentor_sessions_mentee_id_fkey(
            id,
            full_name,
            avatar_url
          ),
          session_type:mentor_session_types(
            type,
            duration
          )
        `)
        .or(`mentor_id.eq.${profile.id},mentee_id.eq.${profile.id}`)
        .order('scheduled_at', { ascending: false });

      if (error) {
        console.error('Error fetching sessions:', error);
        throw error;
      }

      // Transform the data to match our expected types
      return (data || []).map(session => ({
        ...session,
        // Convert database meeting_platform format to our type format
        meeting_platform: session.meeting_platform === 'google_meet' ? 'Google Meet' :
                         session.meeting_platform === 'whatsapp' ? 'WhatsApp' :
                         session.meeting_platform === 'telegram' ? 'Telegram' :
                         session.meeting_platform === 'phone_call' ? 'Phone Call' :
                         session.meeting_platform as any
      }));
    },
    enabled: !!profile?.id,
  });

  const handleFilterChange = (filter: string, value: string) => {
    const newParams = new URLSearchParams(searchParams);
    if (value) {
      newParams.set(filter, value);
    } else {
      newParams.delete(filter);
    }
    setSearchParams(newParams);
  };

  const filteredSessions = React.useMemo(() => {
    let filtered = [...sessions];

    // Filter by status
    const statusFilter = searchParams.get("status");
    if (statusFilter && statusFilter !== "all") {
      filtered = filtered.filter((session) => session.status === statusFilter);
    }

    return filtered;
  }, [sessions, searchParams]);

  return (
    <div className="space-y-4">
      <SessionFilters
        onFilterChange={handleFilterChange}
      />
      <SessionTable sessions={filteredSessions} isLoading={isLoading} refetch={refetch} />
    </div>
  );
}
