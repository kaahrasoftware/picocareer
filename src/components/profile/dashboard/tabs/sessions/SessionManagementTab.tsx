
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { format } from "date-fns";
import { Calendar, Clock, User, Video, Trash2, Edit } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";

interface MentorSession {
  id: string;
  mentor_id: string;
  mentee_id: string;
  session_start_time: string;
  session_end_time: string;
  status: string;
  meeting_link?: string;
  session_notes?: string;
  mentee?: {
    full_name: string;
    email: string;
  };
  mentor?: {
    full_name: string;
    email: string;
  };
}

export function SessionManagementTab() {
  const [activeTab, setActiveTab] = useState("upcoming");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch upcoming sessions
  const { data: upcomingSessions = [], isLoading: isLoadingUpcoming } = useQuery({
    queryKey: ['mentor-sessions', 'upcoming'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('mentor_sessions')
        .select(`
          id,
          mentor_id,
          mentee_id,
          session_start_time,
          session_end_time,
          status,
          meeting_link,
          session_notes,
          mentee:mentee_id(full_name, email),
          mentor:mentor_id(full_name, email)
        `)
        .gte('session_start_time', new Date().toISOString())
        .order('session_start_time', { ascending: true })
        .limit(20);

      if (error) throw error;
      return data || [];
    }
  });

  // Fetch past sessions
  const { data: pastSessions = [], isLoading: isLoadingPast } = useQuery({
    queryKey: ['mentor-sessions', 'past'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('mentor_sessions')
        .select(`
          id,
          mentor_id,
          mentee_id,
          session_start_time,
          session_end_time,
          status,
          meeting_link,
          session_notes,
          mentee:mentee_id(full_name, email),
          mentor:mentor_id(full_name, email)
        `)
        .lt('session_end_time', new Date().toISOString())
        .order('session_start_time', { ascending: false })
        .limit(20);

      if (error) throw error;
      return data || [];
    }
  });

  // Delete session mutation
  const deleteSessionMutation = useMutation({
    mutationFn: async (sessionId: string) => {
      const { error } = await supabase
        .from('mentor_sessions')
        .delete()
        .eq('id', sessionId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['mentor-sessions'] });
      toast({
        title: "Success",
        description: "Session deleted successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to delete session",
        variant: "destructive",
      });
    }
  });

  // Update session status mutation
  const updateSessionMutation = useMutation({
    mutationFn: async ({ sessionId, status }: { sessionId: string; status: string }) => {
      const { error } = await supabase
        .from('mentor_sessions')
        .update({ status })
        .eq('id', sessionId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['mentor-sessions'] });
      toast({
        title: "Success",
        description: "Session updated successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to update session",
        variant: "destructive",
      });
    }
  });

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'confirmed':
        return 'bg-green-500';
      case 'pending':
        return 'bg-yellow-500';
      case 'cancelled':
        return 'bg-red-500';
      case 'completed':
        return 'bg-blue-500';
      default:
        return 'bg-gray-500';
    }
  };

  const SessionCard = ({ session }: { session: MentorSession }) => (
    <Card className="mb-4">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <User className="h-5 w-5" />
            {session.mentee?.full_name || 'Unknown Mentee'}
          </CardTitle>
          <Badge className={getStatusColor(session.status)}>
            {session.status}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-1">
            <Calendar className="h-4 w-4" />
            {format(new Date(session.session_start_time), 'MMM d, yyyy')}
          </div>
          <div className="flex items-center gap-1">
            <Clock className="h-4 w-4" />
            {format(new Date(session.session_start_time), 'h:mm a')} - {format(new Date(session.session_end_time), 'h:mm a')}
          </div>
        </div>
        
        {session.meeting_link && (
          <div className="flex items-center gap-1 text-sm">
            <Video className="h-4 w-4" />
            <a href={session.meeting_link} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
              Join Meeting
            </a>
          </div>
        )}

        {session.session_notes && (
          <div className="text-sm">
            <strong>Notes:</strong> {session.session_notes}
          </div>
        )}

        <div className="flex gap-2 pt-2">
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => updateSessionMutation.mutate({ sessionId: session.id, status: 'completed' })}
            disabled={session.status === 'completed'}
          >
            <Edit className="h-4 w-4 mr-1" />
            Mark Complete
          </Button>
          
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive" size="sm">
                <Trash2 className="h-4 w-4 mr-1" />
                Delete
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete Session</AlertDialogTitle>
                <AlertDialogDescription>
                  Are you sure you want to delete this session? This action cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={() => deleteSessionMutation.mutate(session.id)}>
                  Delete
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Session Management</h2>
        <p className="text-muted-foreground">Manage your mentoring sessions</p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="upcoming">Upcoming Sessions</TabsTrigger>
          <TabsTrigger value="past">Past Sessions</TabsTrigger>
        </TabsList>

        <TabsContent value="upcoming" className="space-y-4">
          {isLoadingUpcoming ? (
            <div className="text-center py-8">Loading upcoming sessions...</div>
          ) : upcomingSessions.length === 0 ? (
            <Card>
              <CardContent className="text-center py-8">
                <p className="text-muted-foreground">No upcoming sessions found</p>
              </CardContent>
            </Card>
          ) : (
            upcomingSessions.map((session) => (
              <SessionCard key={session.id} session={session} />
            ))
          )}
        </TabsContent>

        <TabsContent value="past" className="space-y-4">
          {isLoadingPast ? (
            <div className="text-center py-8">Loading past sessions...</div>
          ) : pastSessions.length === 0 ? (
            <Card>
              <CardContent className="text-center py-8">
                <p className="text-muted-foreground">No past sessions found</p>
              </CardContent>
            </Card>
          ) : (
            pastSessions.map((session) => (
              <SessionCard key={session.id} session={session} />
            ))
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
