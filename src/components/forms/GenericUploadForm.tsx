import { useForm } from "react-hook-form";
import { Form } from "@/components/ui/form";
import { FormField } from "./FormField";
import { FormFieldProps } from "./FormField";
import { useToast } from "@/hooks/use-toast";
import { useAuthSession } from "@/hooks/useAuthSession";
import { supabase } from "@/integrations/supabase/client";

interface GenericUploadFormProps {
  fields: (FormFieldProps & { defaultValue?: any })[];
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
  
  const defaultValues = fields.reduce((acc, field) => ({
    ...acc,
    [field.name]: field.defaultValue || ""
  }), {});

  const form = useForm({ defaultValues });

  const handleSubmit = async (data: any) => {
    try {
      if (!session?.user?.id) {
        throw new Error('User not authenticated');
      }

      // Get the profile id for the current user
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('id')
        .eq('id', session.user.id)
        .single();

      if (profileError || !profile) {
        throw new Error('Could not find user profile');
      }

      // Add author_id to the form data
      const formDataWithAuthor = {
        ...data,
        author_id: profile.id
      };

      console.log('Submitting form data with author:', formDataWithAuthor);
      await onSubmit(formDataWithAuthor);
      
      // Reset form after successful submission
      form.reset(defaultValues);
      
      toast({
        title: "Success",
        description: "Your changes have been saved successfully.",
      });
    } catch (error) {
      console.error('Form submission error:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to save changes. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        {fields.map((field) => (
          <FormField
            key={field.name}
            control={form.control}
            {...field}
          />
        ))}
        <div className="flex justify-end">
          <button
            type="submit"
            className="bg-primary text-primary-foreground hover:bg-primary/90 px-4 py-2 rounded-md"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Submitting..." : buttonText}
          </button>
        </div>
      </form>
    </Form>
  );
}