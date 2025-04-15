
import { useState } from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { useAuthSession } from "@/hooks/useAuthSession";
import { useUserProfile } from "@/hooks/useUserProfile";
import { useSubmitApplication } from "@/hooks/useSubmitApplication";
import { DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";

interface ApplicationFormProps {
  opportunityId: string;
  opportunityTitle: string;
  onComplete: () => void;
}

export function ApplicationForm({ opportunityId, opportunityTitle, onComplete }: ApplicationFormProps) {
  const { session } = useAuthSession();
  const { data: profile } = useUserProfile(session);
  const { submitApplication, isLoading } = useSubmitApplication();
  const [formError, setFormError] = useState<string | null>(null);

  const form = useForm({
    defaultValues: {
      notes: "",
    },
  });

  const handleSubmit = async (data: any) => {
    if (!session || !profile) {
      setFormError("You must be signed in to apply");
      return;
    }

    try {
      setFormError(null);
      await submitApplication({
        opportunity_id: opportunityId,
        profile_id: profile.id,
        notes: data.notes,
      });
      
      onComplete();
    } catch (error: any) {
      console.error("Error submitting application:", error);
      setFormError(error.message || "Failed to submit application. Please try again.");
    }
  };

  return (
    <div>
      <DialogHeader>
        <DialogTitle>Apply for {opportunityTitle}</DialogTitle>
        <DialogDescription>
          Apply for this opportunity directly through our platform
        </DialogDescription>
      </DialogHeader>

      {formError && (
        <div className="bg-destructive/10 text-destructive p-4 rounded-md my-4">
          {formError}
        </div>
      )}

      <div className="mt-6">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Application Notes</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Add any information you'd like to include with your application..."
                      className="min-h-32"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex gap-3 justify-end">
              <Button type="button" variant="outline" onClick={onComplete}>
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? "Submitting..." : "Submit Application"}
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </div>
  );
}
