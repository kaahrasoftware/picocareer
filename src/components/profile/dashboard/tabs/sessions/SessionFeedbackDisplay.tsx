
import React from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ThumbsUp, ThumbsDown, Loader2 } from "lucide-react";

interface SessionFeedbackDisplayProps {
  sessionId: string;
}

export function SessionFeedbackDisplay({ sessionId }: SessionFeedbackDisplayProps) {
  const { data: feedback, isLoading } = useQuery({
    queryKey: ["session-feedback", sessionId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("session_feedback")
        .select(`
          id,
          rating,
          notes,
          recommend,
          did_not_show_up,
          feedback_type,
          to_profile:profiles!to_profile_id(full_name),
          from_profile:profiles!from_profile_id(full_name)
        `)
        .eq("session_id", sessionId);
        
      if (error) throw error;
      return data;
    }
  });
  
  if (isLoading) {
    return (
      <div className="flex justify-center py-6">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }
  
  if (!feedback || feedback.length === 0) {
    return (
      <Card className="bg-muted/30">
        <CardContent className="py-6 text-center text-muted-foreground">
          No feedback has been provided for this session yet.
        </CardContent>
      </Card>
    );
  }
  
  return (
    <div className="space-y-4">
      {feedback.map((item) => (
        <Card key={item.id} className="overflow-hidden">
          <CardContent className="p-0">
            <div className="bg-muted/20 px-4 py-3 flex items-center justify-between">
              <div>
                <Badge variant="outline">
                  {item.feedback_type === 'mentor_feedback' ? "Mentor's Feedback" : "Mentee's Feedback"}
                </Badge>
                <p className="text-xs text-muted-foreground mt-1">
                  From {item.from_profile.full_name} to {item.to_profile.full_name}
                </p>
              </div>
              
              <div className="flex items-center gap-2">
                {item.recommend !== null && (
                  <Badge variant={item.recommend ? "success" : "destructive"} className="gap-1">
                    {item.recommend ? (
                      <><ThumbsUp className="h-3 w-3" /> Recommended</>
                    ) : (
                      <><ThumbsDown className="h-3 w-3" /> Not Recommended</>
                    )}
                  </Badge>
                )}
                
                {item.rating && (
                  <Badge variant="outline" className="bg-amber-50">
                    Rating: {item.rating}/5
                  </Badge>
                )}
                
                {item.did_not_show_up && (
                  <Badge variant="destructive">No-show reported</Badge>
                )}
              </div>
            </div>
            
            {item.notes && (
              <div className="p-4">
                <p className="text-sm">{item.notes}</p>
              </div>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
