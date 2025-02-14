
import { useForm } from "react-hook-form";
import { Form } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { BasicInputField } from "@/components/forms/fields/BasicInputField";
import { supabase } from "@/integrations/supabase/client";
import { HubDepartment } from "@/types/database/hubs";

interface DepartmentFormProps {
  hubId: string;
  onSuccess?: () => void;
  onCancel?: () => void;
  existingDepartment?: HubDepartment;
}

interface FormFields {
  name: string;
  description?: string;
  parent_department_id?: string;
}

export function DepartmentForm({ 
  hubId, 
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
      // Clean the data - convert empty strings to null for UUID fields
      const cleanedData = {
        ...data,
        parent_department_id: data.parent_department_id?.trim() || null
      };

      if (existingDepartment) {
        const { error } = await supabase
          .from('hub_departments')
          .update({
            ...cleanedData,
            updated_at: new Date().toISOString()
          })
          .eq('id', existingDepartment.id);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('hub_departments')
          .insert({
            ...cleanedData,
            hub_id: hubId
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
