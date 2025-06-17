
import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Major } from "@/types/database/majors";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { majorFormFields } from "@/components/forms/major/MajorFormFields";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

// Define a schema for array inputs
const arrayInputSchema = z.string().transform((val) => {
  if (!val.trim()) return [];
  return val.split(",").map((item) => item.trim());
});

// Define a schema for the form
const formSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().min(1, "Description is required"),
  featured: z.boolean().default(false),
  learning_objectives: arrayInputSchema,
  common_courses: arrayInputSchema,
  interdisciplinary_connections: arrayInputSchema,
  job_prospects: z.string().optional().nullable(),
  certifications_to_consider: arrayInputSchema,
  degree_levels: arrayInputSchema,
  affiliated_programs: arrayInputSchema,
  gpa_expectations: z.coerce.number().min(0).max(4).optional().nullable(),
  transferable_skills: arrayInputSchema,
  tools_knowledge: arrayInputSchema,
  potential_salary: z.string().optional().nullable(),
  passion_for_subject: z.string().optional().nullable(),
  skill_match: arrayInputSchema,
  professional_associations: arrayInputSchema,
  global_applicability: z.string().optional().nullable(),
  common_difficulties: arrayInputSchema,
  career_opportunities: arrayInputSchema,
  intensity: z.string().optional().nullable(),
  stress_level: z.string().optional().nullable(),
  dropout_rates: z.string().optional().nullable(),
  majors_to_consider_switching_to: arrayInputSchema,
  status: z.string().default("Pending"),
});

type MajorFormValues = z.infer<typeof formSchema>;

interface MajorFormDialogProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  major?: Major;
}

export function MajorFormDialog({
  open,
  onClose,
  onSuccess,
  major
}: MajorFormDialogProps) {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isEditing = !!major;

  const defaultValues: Partial<MajorFormValues> = major
    ? {
        ...major,
        // Convert arrays to comma-separated strings for the form inputs
        learning_objectives: major.learning_objectives?.join(", ") || "",
        common_courses: major.common_courses?.join(", ") || "",
        interdisciplinary_connections: major.interdisciplinary_connections?.join(", ") || "",
        certifications_to_consider: major.certifications_to_consider?.join(", ") || "",
        degree_levels: major.degree_levels?.join(", ") || "",
        affiliated_programs: major.affiliated_programs?.join(", ") || "",
        transferable_skills: major.transferable_skills?.join(", ") || "",
        tools_knowledge: major.tools_knowledge?.join(", ") || "",
        skill_match: major.skill_match?.join(", ") || "",
        professional_associations: major.professional_associations?.join(", ") || "",
        common_difficulties: major.common_difficulties?.join(", ") || "",
        career_opportunities: major.career_opportunities?.join(", ") || "",
        majors_to_consider_switching_to: major.majors_to_consider_switching_to?.join(", ") || "",
      }
    : {
        featured: false,
        status: "Pending",
      };

  const form = useForm<MajorFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues,
  });

  const onSubmit = async (values: MajorFormValues) => {
    setIsSubmitting(true);
    try {
      if (isEditing) {
        const { error } = await supabase
          .from("majors")
          .update(values)
          .eq("id", major.id);

        if (error) throw error;

        toast({
          title: "Major updated",
          description: "The major has been successfully updated.",
        });
      } else {
        const { error } = await supabase
          .from("majors")
          .insert([values]);

        if (error) throw error;

        toast({
          title: "Major created",
          description: "The major has been successfully created.",
        });
      }

      onSuccess();
    } catch (error) {
      console.error("Error saving major:", error);
      toast({
        title: "Error saving major",
        description: "There was an error saving the major. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Helper function to render form fields based on field type
  const renderFormField = (field: any) => {
    switch (field.type) {
      case "checkbox":
        return (
          <FormField
            key={field.name}
            control={form.control}
            name={field.name as any}
            render={({ field: formField }) => (
              <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                <FormControl>
                  <Checkbox
                    checked={formField.value}
                    onCheckedChange={formField.onChange}
                  />
                </FormControl>
                <div className="space-y-1 leading-none">
                  <FormLabel>{field.label}</FormLabel>
                  {field.description && (
                    <FormDescription>
                      {field.description}
                    </FormDescription>
                  )}
                </div>
              </FormItem>
            )}
          />
        );

      case "textarea":
        return (
          <FormField
            key={field.name}
            control={form.control}
            name={field.name as any}
            render={({ field: formField }) => (
              <FormItem>
                <FormLabel>{field.label}{field.required ? ' *' : ''}</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder={field.placeholder}
                    {...formField}
                    rows={4}
                  />
                </FormControl>
                {field.description && (
                  <FormDescription>
                    {field.description}
                  </FormDescription>
                )}
                <FormMessage />
              </FormItem>
            )}
          />
        );

      case "array":
        return (
          <FormField
            key={field.name}
            control={form.control}
            name={field.name as any}
            render={({ field: formField }) => (
              <FormItem>
                <FormLabel>{field.label}{field.required ? ' *' : ''}</FormLabel>
                <FormControl>
                  <Input
                    placeholder={field.placeholder}
                    {...formField}
                  />
                </FormControl>
                <FormDescription>
                  {field.description || "Enter values separated by commas"}
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        );

      case "number":
        return (
          <FormField
            key={field.name}
            control={form.control}
            name={field.name as any}
            render={({ field: formField }) => (
              <FormItem>
                <FormLabel>{field.label}{field.required ? ' *' : ''}</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    step="0.1"
                    placeholder={field.placeholder}
                    {...formField}
                  />
                </FormControl>
                {field.description && (
                  <FormDescription>
                    {field.description}
                  </FormDescription>
                )}
                <FormMessage />
              </FormItem>
            )}
          />
        );

      default:
        return (
          <FormField
            key={field.name}
            control={form.control}
            name={field.name as any}
            render={({ field: formField }) => (
              <FormItem>
                <FormLabel>{field.label}{field.required ? ' *' : ''}</FormLabel>
                <FormControl>
                  <Input
                    placeholder={field.placeholder}
                    {...formField}
                  />
                </FormControl>
                {field.description && (
                  <FormDescription>
                    {field.description}
                  </FormDescription>
                )}
                <FormMessage />
              </FormItem>
            )}
          />
        );
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[800px] max-h-[90vh]">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? `Edit Major: ${major.title}` : "Add New Major"}
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <ScrollArea className="h-[60vh] pr-4">
              <Tabs defaultValue="basic">
                <TabsList className="mb-4">
                  <TabsTrigger value="basic">Basic Info</TabsTrigger>
                  <TabsTrigger value="academic">Academic</TabsTrigger>
                  <TabsTrigger value="career">Career</TabsTrigger>
                  <TabsTrigger value="skills">Skills & Requirements</TabsTrigger>
                  <TabsTrigger value="challenges">Challenges</TabsTrigger>
                </TabsList>

                <TabsContent value="basic" className="space-y-4">
                  {renderFormField(majorFormFields.find(f => f.name === "title"))}
                  {renderFormField(majorFormFields.find(f => f.name === "description"))}
                  {renderFormField(majorFormFields.find(f => f.name === "featured"))}
                  
                  <FormField
                    control={form.control}
                    name="status"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Status</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select a status" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="Pending">Pending</SelectItem>
                            <SelectItem value="Approved">Approved</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormDescription>
                          Set the visibility status of this major
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </TabsContent>

                <TabsContent value="academic" className="space-y-4">
                  {renderFormField(majorFormFields.find(f => f.name === "learning_objectives"))}
                  {renderFormField(majorFormFields.find(f => f.name === "common_courses"))}
                  {renderFormField(majorFormFields.find(f => f.name === "interdisciplinary_connections"))}
                  {renderFormField(majorFormFields.find(f => f.name === "degree_levels"))}
                  {renderFormField(majorFormFields.find(f => f.name === "affiliated_programs"))}
                  {renderFormField(majorFormFields.find(f => f.name === "gpa_expectations"))}
                </TabsContent>

                <TabsContent value="career" className="space-y-4">
                  {renderFormField(majorFormFields.find(f => f.name === "job_prospects"))}
                  {renderFormField(majorFormFields.find(f => f.name === "career_opportunities"))}
                  {renderFormField(majorFormFields.find(f => f.name === "professional_associations"))}
                  {renderFormField(majorFormFields.find(f => f.name === "global_applicability"))}
                  {renderFormField(majorFormFields.find(f => f.name === "potential_salary"))}
                  {renderFormField(majorFormFields.find(f => f.name === "certifications_to_consider"))}
                </TabsContent>

                <TabsContent value="skills" className="space-y-4">
                  {renderFormField(majorFormFields.find(f => f.name === "transferable_skills"))}
                  {renderFormField(majorFormFields.find(f => f.name === "tools_knowledge"))}
                  {renderFormField(majorFormFields.find(f => f.name === "skill_match"))}
                  {renderFormField(majorFormFields.find(f => f.name === "passion_for_subject"))}
                </TabsContent>

                <TabsContent value="challenges" className="space-y-4">
                  {renderFormField(majorFormFields.find(f => f.name === "intensity"))}
                  {renderFormField(majorFormFields.find(f => f.name === "stress_level"))}
                  {renderFormField(majorFormFields.find(f => f.name === "dropout_rates"))}
                  {renderFormField(majorFormFields.find(f => f.name === "common_difficulties"))}
                  {renderFormField(majorFormFields.find(f => f.name === "majors_to_consider_switching_to"))}
                </TabsContent>
              </Tabs>
            </ScrollArea>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting
                  ? "Saving..."
                  : isEditing
                  ? "Update Major"
                  : "Create Major"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
