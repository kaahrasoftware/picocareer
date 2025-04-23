import React, { useState, useEffect } from 'react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { cn } from "@/lib/utils"
import { format } from "date-fns"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/hooks/use-toast"
import { supabase } from '@/integrations/supabase/client';
import { useAuthSession } from '@/hooks/useAuthSession';
import { Loader2 } from 'lucide-react';

interface MentorSession {
  id: string;
  mentor_id: string;
  mentee_id: string;
  session_type_id: string;
  scheduled_at: string;
  status: string;
  notes?: string;
  meeting_platform?: string;
  mentee_phone_number?: string;
  mentee_telegram_username?: string;
  created_at: string;
  updated_at: string;
  mentor?: {
    id: string;
    full_name: string;
    avatar_url?: string;
  };
  session_type?: {
    id: string;
    profile_id: string;
    type: string;
    duration: number;
    price: number;
    token_cost: number;
    description?: string;
    custom_type_name?: string;
    meeting_platform?: string[];
    telegram_username?: string;
    phone_number?: string;
    created_at: string;
    updated_at: string;
  };
}

interface BookSessionDialogProps {
  isOpen: boolean;
  onClose: () => void;
  sessionId: string | null;
}

export function BookSessionDialog({ isOpen, onClose, sessionId }: BookSessionDialogProps) {
  const [date, setDate] = React.useState<Date | undefined>(new Date());
  const [session, setSession] = useState<MentorSession | null>(null);
  const [notes, setNotes] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const { toast } = useToast();
  const { session: authSession } = useAuthSession();

  useEffect(() => {
    if (sessionId) {
      fetchSession(sessionId);
    }
  }, [sessionId]);

  const fetchSession = async (id: string) => {
  try {
    // Use a manual type-safe approach to avoid TypeScript errors
    const { data, error } = await supabase
      .rpc('get_session_details', { session_id: id })
      .single();

    if (error) {
      // Fallback to direct query if RPC doesn't exist
      const { data: sessionData, error: sessionError } = await supabase
        .from('mentor_sessions')
        .select('*')
        .eq('id', id)
        .single();

      if (sessionError) {
        console.error('Error fetching session:', sessionError);
        return;
      }

      // Fetch related mentor data separately
      const { data: mentorData } = await supabase
        .from('profiles')
        .select('id, full_name, avatar_url')
        .eq('id', sessionData.mentor_id)
        .single();

      // Fetch session type data separately
      const { data: sessionTypeData } = await supabase
        .from('mentor_session_types')
        .select('*')
        .eq('id', sessionData.session_type_id)
        .single();

      // Combine the data
      const completeSessionData = {
        ...sessionData,
        mentor: mentorData,
        session_type: sessionTypeData
      };

      setSession(completeSessionData as any);
      return;
    }

    setSession(data as any);
  } catch (err) {
    console.error('Failed to fetch session:', err);
  }
};

  const handleBookSession = async () => {
    if (!date) {
      toast({
        title: "Please select a date",
        variant: "destructive",
      });
      return;
    }

    if (!authSession?.user?.id) {
      toast({
        title: "Please sign in to book a session",
        variant: "destructive",
      });
      return;
    }

    if (!session) {
      toast({
        title: "Session not loaded",
        variant: "destructive",
      });
      return;
    }

    setSubmitting(true);
    try {
      const { error } = await supabase
        .from('mentor_sessions')
        .update({
          scheduled_at: date.toISOString(),
          mentee_id: authSession.user.id,
          notes: notes,
          status: 'pending'
        })
        .eq('id', session.id);

      if (error) {
        throw error;
      }

      toast({
        title: "Session booked!",
        description: "Your session has been booked successfully.",
      });
      onClose();
    } catch (error: any) {
      toast({
        title: "Error booking session",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <AlertDialog open={isOpen} onOpenChange={onClose}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Book Session</AlertDialogTitle>
          <AlertDialogDescription>
            {session ? (
              <>
                <p>
                  You are booking a session with {session?.mentor?.full_name}
                </p>
                <p>
                  Session Type: {session?.session_type?.custom_type_name || session?.session_type?.type}
                </p>
                <p>
                  Duration: {session?.session_type?.duration} minutes
                </p>
              </>
            ) : (
              "Loading session details..."
            )}
          </AlertDialogDescription>
        </AlertDialogHeader>
        {session && (
          <>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label>Scheduled Date</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant={"outline"}
                        className={cn(
                          "w-full pl-3 text-left font-normal",
                          !date && "text-muted-foreground"
                        )}
                      >
                        {date ? format(date, "PPP") : (
                          <span>Pick a date</span>
                        )}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="center">
                      <Calendar
                        mode="single"
                        selected={date}
                        onSelect={setDate}
                        disabled={(date) =>
                          date < new Date()
                        }
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>
                <div>
                  <Label>Scheduled Time</Label>
                  <Input
                    type="time"
                    value={date ? format(date, "HH:mm") : ""}
                    onChange={(e) => {
                      if (date) {
                        const [hours, minutes] = e.target.value.split(":");
                        const newDate = new Date(date);
                        newDate.setHours(parseInt(hours));
                        newDate.setMinutes(parseInt(minutes));
                        setDate(newDate);
                      }
                    }}
                  />
                </div>
              </div>
              <div>
                <Label>Notes</Label>
                <Textarea
                  placeholder="Add any notes for the mentor"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                />
              </div>
            </div>
          </>
        )}
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction disabled={submitting} onClick={handleBookSession}>
            {submitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Booking...
              </>
            ) : (
              "Book Session"
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
