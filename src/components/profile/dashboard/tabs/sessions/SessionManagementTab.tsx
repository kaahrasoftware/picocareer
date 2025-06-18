
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAuthSession } from "@/hooks/useAuthSession";
import { useUserProfile } from "@/hooks/useUserProfile";
import { Calendar, Clock, User, Phone, MessageCircle, Video, ExternalLink } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { format, parseISO } from "date-fns";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface MentorSession {
  id: string;
  status: string;
  scheduled_at: string;
  notes: string;
  meeting_link: string;
  meeting_platform: "whatsapp" | "google_meet" | "telegram" | "phone_call";
  mentor: {
    id: string;
    full_name: string;
    avatar_url: string;
  };
  mentee: {
    id: string;
    full_name: string;
    avatar_url: string;
  };
  session_type: {
    id: string;
    type: string;
    duration: number;
    price: number;
  };
}

const platformIcons = {
  whatsapp: Phone,
  google_meet: Video,
  telegram: MessageCircle,
  phone_call: Phone,
};

const platformLabels = {
  whatsapp: "WhatsApp",
  google_meet: "Google Meet", 
  telegram: "Telegram",
  phone_call: "Phone Call",
};

export function SessionManagementTab() {
  const { session } = useAuthSession();
  const { data: profile } = useUserProfile(session);
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [selectedSession, setSelectedSession] = useState<MentorSession | null>(null);
  const [isRescheduleDialogOpen, setIsRescheduleDialogOpen] = useState(false);
  const [rescheduleNotes, setRescheduleNotes] = useState("");
  const [newScheduledTime, setNewScheduledTime] = useState("");

  // Fetch upcoming sessions
  const { data: upcomingSessions = [], isLoading: upcomingLoading } = useQuery({
    queryKey: ['upcoming-sessions', profile?.id],
    queryFn: async () => {
      if (!profile?.id) return [];
      
      const { data, error } = await supabase
        .from('mentoring_sessions')
        .select(`
          id,
          status,
          scheduled_at,
          notes,
          meeting_link,
          meeting_platform,
          mentor:mentor_id(id, full_name, avatar_url),
          mentee:mentee_id(id, full_name, avatar_url),
          session_type:session_type_id(id, type, duration, price)
        `)
        .eq('mentor_id', profile.id)
        .in('status', ['scheduled', 'confirmed'])
        .gte('scheduled_at', new Date().toISOString())
        .order('scheduled_at');

      if (error) throw error;

      // Transform the data to match expected interface
      return (data || []).map(session => ({
        ...session,
        meeting_platform: transformPlatformValue(session.meeting_platform)
      })) as MentorSession[];
    },
    enabled: !!profile?.id
  });

  // Fetch past sessions  
  const { data: pastSessions = [], isLoading: pastLoading } = useQuery({
    queryKey: ['past-sessions', profile?.id],
    queryFn: async () => {
      if (!profile?.id) return [];
      
      const { data, error } = await supabase
        .from('mentoring_sessions')
        .select(`
          id,
          status,
          scheduled_at,
          notes,
          meeting_link,
          meeting_platform,
          mentor:mentor_id(id, full_name, avatar_url),
          mentee:mentee_id(id, full_name, avatar_url),
          session_type:session_type_id(id, type, duration, price)
        `)
        .eq('mentor_id', profile.id)
        .in('status', ['completed', 'cancelled'])
        .lt('scheduled_at', new Date().toISOString())
        .order('scheduled_at', { ascending: false });

      if (error) throw error;

      // Transform the data to match expected interface
      return (data || []).map(session => ({
        ...session,
        meeting_platform: transformPlatformValue(session.meeting_platform)
      })) as MentorSession[];
    },
    enabled: !!profile?.id
  });

  // Helper function to transform platform values
  const transformPlatformValue = (platform: string): "whatsapp" | "google_meet" | "telegram" | "phone_call" => {
    switch (platform) {
      case "WhatsApp":
        return "whatsapp";
      case "Google Meet":
        return "google_meet";
      case "Telegram":
        return "telegram";
      case "Phone Call":
        return "phone_call";
      default:
        return platform as "whatsapp" | "google_meet" | "telegram" | "phone_call";
    }
  };

  // Reschedule session mutation
  const rescheduleSessionMutation = useMutation({
    mutationFn: async ({ sessionId, newTime, notes }: { sessionId: string; newTime: string; notes: string }) => {
      const { error } = await supabase
        .from('mentoring_sessions')
        .update({
          scheduled_at: newTime,
          notes: notes,
          status: 'rescheduled'
        })
        .eq('id', sessionId);

      if (error) throw error;
    },
    onSuccess: () => {
      toast({
        title: "Session rescheduled",
        description: "The session has been successfully rescheduled.",
      });
      queryClient.invalidateQueries({ queryKey: ['upcoming-sessions'] });
      queryClient.invalidateQueries({ queryKey: ['past-sessions'] });
      setIsRescheduleDialogOpen(false);
      setSelectedSession(null);
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to reschedule session. Please try again.",
        variant: "destructive",
      });
      console.error("Error rescheduling session:", error);
    }
  });

  // Cancel session mutation
  const cancelSessionMutation = useMutation({
    mutationFn: async (sessionId: string) => {
      const { error } = await supabase
        .from('mentoring_sessions')
        .update({ status: 'cancelled' })
        .eq('id', sessionId);

      if (error) throw error;
    },
    onSuccess: () => {
      toast({
        title: "Session cancelled",
        description: "The session has been cancelled.",
      });
      queryClient.invalidateQueries({ queryKey: ['upcoming-sessions'] });
      queryClient.invalidateQueries({ queryKey: ['past-sessions'] });
    },
    onError: (error) => {
      toast({
        title: "Error", 
        description: "Failed to cancel session. Please try again.",
        variant: "destructive",
      });
      console.error("Error cancelling session:", error);
    }
  });

  const handleReschedule = (session: MentorSession) => {
    setSelectedSession(session);
    setNewScheduledTime(session.scheduled_at);
    setRescheduleNotes(session.notes || "");
    setIsRescheduleDialogOpen(true);
  };

  const handleRescheduleSubmit = () => {
    if (!selectedSession || !newScheduledTime) return;

    rescheduleSessionMutation.mutate({
      sessionId: selectedSession.id,
      newTime: newScheduledTime,
      notes: rescheduleNotes
    });
  };

  const handleCancel = (sessionId: string) => {
    if (confirm("Are you sure you want to cancel this session?")) {
      cancelSessionMutation.mutate(sessionId);
    }
  };

  const renderSessionCard = (session: MentorSession) => {
    const PlatformIcon = platformIcons[session.meeting_platform];
    
    return (
      <Card key={session.id} className="mb-4">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">{session.session_type.type}</CardTitle>
            <Badge variant={session.status === 'confirmed' ? 'default' : 'secondary'}>
              {session.status}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Calendar className="h-4 w-4" />
            {format(parseISO(session.scheduled_at), 'PPP')}
          </div>
          
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Clock className="h-4 w-4" />
            {format(parseISO(session.scheduled_at), 'p')} ({session.session_type.duration} min)
          </div>

          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <User className="h-4 w-4" />
            {session.mentee.full_name}
          </div>

          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <PlatformIcon className="h-4 w-4" />
            {platformLabels[session.meeting_platform]}
          </div>

          {session.meeting_link && (
            <div className="flex items-center gap-2">
              <ExternalLink className="h-4 w-4" />
              <a 
                href={session.meeting_link} 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-sm text-blue-600 hover:underline"
              >
                Join Meeting
              </a>
            </div>
          )}

          {session.notes && (
            <div className="text-sm text-muted-foreground">
              <strong>Notes:</strong> {session.notes}
            </div>
          )}

          {session.status === 'scheduled' && (
            <div className="flex gap-2 pt-2">
              <Button 
                size="sm" 
                variant="outline"
                onClick={() => handleReschedule(session)}
              >
                Reschedule
              </Button>
              <Button 
                size="sm" 
                variant="destructive"
                onClick={() => handleCancel(session.id)}
              >
                Cancel
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    );
  };

  if (upcomingLoading || pastLoading) {
    return <div className="flex items-center justify-center p-8">Loading sessions...</div>;
  }

  return (
    <div className="space-y-6">
      <Tabs defaultValue="upcoming" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="upcoming">Upcoming Sessions ({upcomingSessions.length})</TabsTrigger>
          <TabsTrigger value="past">Past Sessions ({pastSessions.length})</TabsTrigger>
        </TabsList>
        
        <TabsContent value="upcoming" className="space-y-4">
          {upcomingSessions.length === 0 ? (
            <Card>
              <CardContent className="p-6 text-center text-muted-foreground">
                No upcoming sessions scheduled.
              </CardContent>
            </Card>
          ) : (
            upcomingSessions.map(renderSessionCard)
          )}
        </TabsContent>
        
        <TabsContent value="past" className="space-y-4">
          {pastSessions.length === 0 ? (
            <Card>
              <CardContent className="p-6 text-center text-muted-foreground">
                No past sessions found.
              </CardContent>
            </Card>
          ) : (
            pastSessions.map(renderSessionCard)
          )}
        </TabsContent>
      </Tabs>

      {/* Reschedule Dialog */}
      <Dialog open={isRescheduleDialogOpen} onOpenChange={setIsRescheduleDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reschedule Session</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="new-time">New Date & Time</Label>
              <input
                id="new-time"
                type="datetime-local"
                value={newScheduledTime ? format(parseISO(newScheduledTime), "yyyy-MM-dd'T'HH:mm") : ""}
                onChange={(e) => setNewScheduledTime(new Date(e.target.value).toISOString())}
                className="w-full p-2 border rounded-md"
              />
            </div>
            <div>
              <Label htmlFor="reschedule-notes">Notes</Label>
              <Textarea
                id="reschedule-notes"
                value={rescheduleNotes}
                onChange={(e) => setRescheduleNotes(e.target.value)}
                placeholder="Add any notes about the reschedule..."
                rows={3}
              />
            </div>
            <div className="flex gap-2">
              <Button onClick={handleRescheduleSubmit} disabled={rescheduleSessionMutation.isPending}>
                {rescheduleSessionMutation.isPending ? "Rescheduling..." : "Reschedule"}
              </Button>
              <Button variant="outline" onClick={() => setIsRescheduleDialogOpen(false)}>
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
