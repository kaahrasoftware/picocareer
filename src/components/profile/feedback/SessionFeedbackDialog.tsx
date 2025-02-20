
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Star } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";

interface SessionFeedbackDialogProps {
  sessionId: string;
  isOpen: boolean;
  onClose: () => void;
  feedbackType: 'mentor_feedback' | 'mentee_feedback';
  fromProfileId: string;
  toProfileId: string;
}

export function SessionFeedbackDialog({
  sessionId,
  isOpen,
  onClose,
  feedbackType,
  fromProfileId,
  toProfileId,
}: SessionFeedbackDialogProps) {
  const [rating, setRating] = useState(0);
  const [recommend, setRecommend] = useState(false);
  const [notes, setNotes] = useState("");
  const [didNotShowUp, setDidNotShowUp] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async () => {
    // Only validate rating if it's not a no-show report
    if (!didNotShowUp && rating === 0) {
      toast({
        title: "Rating Required",
        description: "Please provide a rating or mark as no-show before submitting feedback.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const { error: feedbackError } = await supabase
        .from('session_feedback')
        .insert({
          session_id: sessionId,
          feedback_type: feedbackType,
          rating: didNotShowUp ? null : rating,
          recommend: didNotShowUp ? null : recommend,
          notes,
          from_profile_id: fromProfileId,
          to_profile_id: toProfileId,
          did_not_show_up: didNotShowUp
        });

      if (feedbackError) throw feedbackError;

      const { error: sessionError } = await supabase
        .from('mentor_sessions')
        .update({ 
          status: didNotShowUp ? 'no_show' : 'completed'
        })
        .eq('id', sessionId);

      if (sessionError) throw sessionError;

      toast({
        title: "Feedback Submitted",
        description: "Thank you for providing your feedback!",
      });

      onClose();
    } catch (error) {
      console.error('Error submitting feedback:', error);
      toast({
        title: "Error",
        description: "Failed to submit feedback. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Session Feedback</DialogTitle>
        </DialogHeader>
        <div className="space-y-6 py-4">
          <div className="space-y-2">
            <div className="flex items-center space-x-2 pb-4">
              <Switch
                id="no-show"
                checked={didNotShowUp}
                onCheckedChange={(checked) => {
                  setDidNotShowUp(checked);
                  if (checked) {
                    setRating(0);
                    setRecommend(false);
                  }
                }}
              />
              <Label htmlFor="no-show">The person did not show up for the session</Label>
            </div>
            <Separator className="my-2" />
            {!didNotShowUp && (
              <>
                <Label>Rating</Label>
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map((value) => (
                    <button
                      key={value}
                      onClick={() => setRating(value)}
                      className="focus:outline-none"
                      disabled={didNotShowUp}
                    >
                      <Star
                        className={`h-6 w-6 ${
                          value <= rating
                            ? "fill-yellow-400 text-yellow-400"
                            : "text-gray-300"
                        }`}
                      />
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>

          {/* Only show recommendation question for mentee feedback and when it's not a no-show */}
          {feedbackType === 'mentee_feedback' && !didNotShowUp && (
            <div className="flex items-center space-x-2">
              <Switch
                id="recommend"
                checked={recommend}
                onCheckedChange={setRecommend}
              />
              <Label htmlFor="recommend">Would you recommend this mentor?</Label>
            </div>
          )}

          <div className="space-y-2">
            <Label>Additional Notes</Label>
            <Textarea
              placeholder={didNotShowUp 
                ? "Please provide any additional context about the no-show..."
                : "Share your thoughts about the session..."
              }
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="min-h-[100px]"
            />
          </div>

          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={isSubmitting}
            >
              Submit Feedback
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
