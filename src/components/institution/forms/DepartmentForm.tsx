
import { useForm } from "react-hook-form";
import { Form } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { BasicInputField } from "@/components/forms/fields/BasicInputField";
import { supabase } from "@/integrations/supabase/client";
import { InstitutionDepartment } from "@/types/database/institutions";

interface DepartmentFormProps {
  institutionId: string;
  onSuccess?: () => void;
  onCancel?: () => void;
  existingDepartment?: InstitutionDepartment;
}

interface FormFields {
  name: string;
  description?: string;
  parent_department_id?: string;
}

export function DepartmentForm({ 
  institutionId, 
  onSuccess,
  onCancel,
  existingDepartment 
}: DepartmentFormProps) {
  const { toast } = useToast();

  const form = useForm<FormFields>({
    defaultValues: {
      name: existingDepartment?.name || "",
      description: existingDepartment?.description || "",
      parent_department_id: existingDepartment?.parent_department_id || ""
    }
  });

  const onSubmit = async (data: FormFields) => {
    try {
      if (existingDepartment) {
        const { error } = await supabase
          .from('institution_departments')
          .update({
            ...data,
            updated_at: new Date().toISOString()
          })
          .eq('id', existingDepartment.id);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('institution_departments')
          .insert({
            ...data,
            institution_id: institutionId
          });

        if (error) throw error;
      }

      toast({
        title: "Success",
        description: `Department ${existingDepartment ? 'updated' : 'created'} successfully.`
      });

      if (onSuccess) onSuccess();
    } catch (error) {
      console.error('Error saving department:', error);
      toast({
        title: "Error",
        description: "Failed to save department. Please try again.",
        variant: "destructive"
      });
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <BasicInputField
          field={form.register("name")}
          label="Name"
          placeholder="Enter department name"
          required
        />

        <BasicInputField
          field={form.register("description")}
          label="Description"
          placeholder="Enter department description"
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
