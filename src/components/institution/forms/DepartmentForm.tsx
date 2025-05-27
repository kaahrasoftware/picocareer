
import { useForm } from "react-hook-form";
import { Form } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { BasicInputField } from "@/components/forms/fields/BasicInputField";

interface DepartmentFormProps {
  institutionId: string;
  onSuccess?: () => void;
  onCancel?: () => void;
}

interface FormFields {
  name: string;
  description: string;
}

export function DepartmentForm({ 
  institutionId, 
  onSuccess,
  onCancel
}: DepartmentFormProps) {
  const { toast } = useToast();

  const form = useForm<FormFields>({
    defaultValues: {
      name: "",
      description: ""
    }
  });

  const onSubmit = async (data: FormFields) => {
    try {
      // Since institution_departments table doesn't exist, show placeholder behavior
      console.log('Would create department:', data);
      
      toast({
        title: "Feature Coming Soon",
        description: "Institution departments will be available in a future update.",
      });

      if (onSuccess) onSuccess();
    } catch (error) {
      console.error('Error in department form:', error);
      toast({
        title: "Error",
        description: "This feature is not yet implemented.",
        variant: "destructive"
      });
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <BasicInputField
          field={form.register("name")}
          label="Department Name"
          placeholder="Enter department name"
          required
        />

        <BasicInputField
          field={form.register("description")}
          label="Description"
          placeholder="Enter department description"
          required
        />

        <div className="flex justify-end gap-4">
          {onCancel && (
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancel
            </Button>
          )}
          <Button type="submit">
            {form.formState.isSubmitting ? "Saving..." : "Save Department"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
