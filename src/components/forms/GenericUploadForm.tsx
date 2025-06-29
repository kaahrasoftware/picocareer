
import { useForm, Controller } from "react-hook-form";
import { Form } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { useAuthSession } from "@/hooks/useAuthSession";
import { useUserProfile } from "@/hooks/useUserProfile";
import { Button } from "@/components/ui/button";
import { FormField } from "./FormField";
import { supabase } from "@/integrations/supabase/client";

interface GenericUploadFormProps {
  fields: any[];
  onSubmit: (data: any) => Promise<void>;
  buttonText?: string;
  isSubmitting?: boolean;
}

export function GenericUploadForm({ 
  fields, 
  onSubmit, 
  buttonText = "Submit",
  isSubmitting = false
}: GenericUploadFormProps) {
  const { toast } = useToast();
  const { session } = useAuthSession();
  const { data: profile } = useUserProfile(session);
  
  // Initialize form with default values and validation rules
  const defaultValues = fields.reduce((acc, field) => ({
    ...acc,
    [field.name]: field.defaultValue || ""
  }), {});

  const form = useForm({
    defaultValues,
    // Add validation mode to check on submit
    mode: "onSubmit"
  });

  const handleSubmit = async (data: any) => {
    if (!session?.user?.id || !profile?.id) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to submit content.",
        variant: "destructive",
      });
      return;
    }

    // Validate required fields
    const missingFields = fields
      .filter(field => field.required)
      .filter(field => !data[field.name])
      .map(field => field.label);

    if (missingFields.length > 0) {
      toast({
        title: "Required Fields Missing",
        description: `Please fill in the following fields: ${missingFields.join(", ")}`,
        variant: "destructive",
      });
      return;
    }

    try {
      // Add author_id to form data
      const dataWithAuthor = {
        ...data,
        author_id: profile.id,
        status: 'Pending'
      };

      await onSubmit(dataWithAuthor);

      // Reset form after successful submission
      form.reset(defaultValues);

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
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        {fields.map((field) => {
          if (field.type === "richtext" && field.component) {
            const RichTextComponent = field.component;
            return (
              <div key={field.name} className="space-y-2">
                <label className="text-sm font-medium">{field.label}</label>
                <RichTextComponent
                  value={form.watch(field.name) || ""}
                  onChange={(value: string) => form.setValue(field.name, value)}
                  placeholder={field.placeholder}
                  uploadConfig={field.bucket ? {
                    bucket: field.bucket,
                    folderPath: `blog-content/${profile?.id || 'anonymous'}/`
                  } : undefined}
                />
                {field.required && !form.watch(field.name) && (
                  <p className="text-sm text-red-500">This field is required</p>
                )}
              </div>
            );
          }
          return (
            <Controller
              key={field.name}
              control={form.control}
              name={field.name}
              render={({ field: controllerField }) => (
                <FormField
                  name={field.name}
                  field={controllerField}
                  label={field.label}
                  type={field.type}
                  placeholder={field.placeholder}
                  description={field.description}
                  required={field.required}
                  options={field.options}
                />
              )}
            />
          );
        })}
        <Button 
          type="submit" 
          disabled={isSubmitting}
          className="w-full"
        >
          {isSubmitting ? "Submitting..." : buttonText}
        </Button>
      </form>
    </Form>
  );
}
