
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Major } from "@/types/database/majors";

const majorSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().min(1, "Description is required"),
  featured: z.boolean().default(false),
  learning_objectives: z.array(z.string()).default([]),
  common_courses: z.array(z.string()).default([]),
  interdisciplinary_connections: z.array(z.string()).default([]),
  certifications_to_consider: z.array(z.string()).default([]),
  degree_levels: z.array(z.string()).default([]),
  affiliated_programs: z.array(z.string()).default([]),
  gpa_expectations: z.number().nullable().optional(),
  transferable_skills: z.array(z.string()).default([]),
  tools_knowledge: z.array(z.string()).default([]),
  potential_salary: z.string().optional(),
  passion_for_subject: z.string().optional(),
  skill_match: z.array(z.string()).default([]),
  professional_associations: z.array(z.string()).default([]),
  global_applicability: z.string().optional(),
  common_difficulties: z.array(z.string()).default([]),
  career_opportunities: z.array(z.string()).default([]),
  intensity: z.string().optional(),
  stress_level: z.string().optional(),
  dropout_rates: z.string().optional(),
  majors_to_consider_switching_to: z.array(z.string()).default([]),
  job_prospects: z.string().optional(),
  status: z.enum(["Approved", "Pending", "Rejected"]).default("Approved"),
});

type MajorFormData = z.infer<typeof majorSchema>;

interface MajorFormDialogProps {
  isOpen: boolean;
  onClose: () => void;
  major?: Major;
  onSuccess: () => void;
}

export function MajorFormDialog({ isOpen, onClose, major, onSuccess }: MajorFormDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const form = useForm<MajorFormData>({
    resolver: zodResolver(majorSchema),
    defaultValues: {
      title: major?.title || "",
      description: major?.description || "",
      featured: major?.featured || false,
      learning_objectives: major?.learning_objectives || [],
      common_courses: major?.common_courses || [],
      interdisciplinary_connections: major?.interdisciplinary_connections || [],
      certifications_to_consider: major?.certifications_to_consider || [],
      degree_levels: major?.degree_levels || [],
      affiliated_programs: major?.affiliated_programs || [],
      gpa_expectations: major?.gpa_expectations || null,
      transferable_skills: major?.transferable_skills || [],
      tools_knowledge: major?.tools_knowledge || [],
      potential_salary: major?.potential_salary || "",
      passion_for_subject: major?.passion_for_subject || "",
      skill_match: major?.skill_match || [],
      professional_associations: major?.professional_associations || [],
      global_applicability: major?.global_applicability || "",
      common_difficulties: major?.common_difficulties || [],
      career_opportunities: major?.career_opportunities || [],
      intensity: major?.intensity || "",
      stress_level: major?.stress_level || "",
      dropout_rates: major?.dropout_rates || "",
      majors_to_consider_switching_to: major?.majors_to_consider_switching_to || [],
      job_prospects: major?.job_prospects || "",
      status: (major?.status as "Approved" | "Pending" | "Rejected") || "Approved",
    },
  });

  const onSubmit = async (data: MajorFormData) => {
    try {
      setIsSubmitting(true);

      const majorData = {
        ...data,
        gpa_expectations: data.gpa_expectations ? Number(data.gpa_expectations) : null,
        updated_at: new Date().toISOString(),
      };

      if (major) {
        const { error } = await supabase
          .from('majors')
          .update(majorData)
          .eq('id', major.id);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('majors')
          .insert([majorData]);

        if (error) throw error;
      }

      toast({
        title: "Success",
        description: `Major ${major ? 'updated' : 'created'} successfully`,
      });

      onSuccess();
      onClose();
    } catch (error) {
      console.error('Error saving major:', error);
      toast({
        title: "Error",
        description: "Failed to save major. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    form.reset();
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{major ? 'Edit Major' : 'Create New Major'}</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Title</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter major title" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Status</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="Approved">Approved</SelectItem>
                        <SelectItem value="Pending">Pending</SelectItem>
                        <SelectItem value="Rejected">Rejected</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Enter major description"
                      className="min-h-[100px]"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="featured"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">Featured</FormLabel>
                      <FormDescription>
                        Mark this major as featured
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="gpa_expectations"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>GPA Expectations</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.1"
                        min="0"
                        max="4"
                        placeholder="3.5"
                        value={field.value || ""}
                        onChange={(e) => field.onChange(e.target.value ? parseFloat(e.target.value) : null)}
                      />
                    </FormControl>
                    <FormDescription>
                      Expected GPA for this major (0.0 - 4.0)
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="flex justify-end space-x-2">
              <Button type="button" variant="outline" onClick={handleClose}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Saving...' : (major ? 'Update Major' : 'Create Major')}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
