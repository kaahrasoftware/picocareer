import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { useAuthSession } from "@/hooks/useAuthSession";
import { useUserProfile } from "@/hooks/useUserProfile";
import { Button } from "@/components/ui/button";
import { FormField } from "./FormField";
import { supabase } from "@/integrations/supabase/client";

interface GenericUploadFormProps {
  fields: any[];
  onSubmit: (data: any) => Promise<void>;
  submitButtonText?: string;
}

export function GenericUploadForm({ fields, onSubmit, submitButtonText = "Submit" }: GenericUploadFormProps) {
  // Move all hooks to the top level
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const { session } = useAuthSession();
  const { data: profile } = useUserProfile(session);

  const handleFieldChange = (fieldName: string, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [fieldName]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!session?.user?.id || !profile?.id) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to submit content.",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsSubmitting(true);
      
      // Add author_id to form data
      const dataWithAuthor = {
        ...formData,
        author_id: profile.id,
        status: 'Pending'
      };

      await onSubmit(dataWithAuthor);

      // Clear form after successful submission
      setFormData({});

      toast({
        title: "Success",
        description: "Your changes have been saved successfully.",
      });
    } catch (error: any) {
      console.error('Form submission error:', error);
      
      // Parse the error message if it's from Supabase
      let errorMessage = "Failed to save changes. Please try again.";
      
      if (error.body) {
        try {
          const parsedError = JSON.parse(error.body);
          errorMessage = parsedError.message;
        } catch {
          // If parsing fails, use the original error message
          errorMessage = error instanceof Error ? error.message : errorMessage;
        }
      }
      
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {fields.map((field) => (
        <FormField
          key={field.name}
          field={field}
          value={formData[field.name] || ""}
          onChange={(value) => handleFieldChange(field.name, value)}
        />
      ))}
      <Button 
        type="submit" 
        disabled={isSubmitting}
        className="w-full"
      >
        {isSubmitting ? "Submitting..." : submitButtonText}
      </Button>
    </form>
  );
}