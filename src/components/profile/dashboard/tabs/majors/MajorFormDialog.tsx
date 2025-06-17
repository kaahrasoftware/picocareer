import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Major } from "@/types/database/majors";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const formSchema = z.object({
  title: z.string().min(2, {
    message: "Major title must be at least 2 characters.",
  }),
  description: z.string().min(10, {
    message: "Description must be at least 10 characters.",
  }),
  featured: z.boolean().default(false),
  learning_objectives: z.string().optional(),
  common_courses: z.string().optional(),
  interdisciplinary_connections: z.string().optional(),
  job_prospects: z.string().optional(),
  certifications_to_consider: z.string().optional(),
  degree_levels: z.string().optional(),
  affiliated_programs: z.string().optional(),
  gpa_expectations: z.string().optional(),
  transferable_skills: z.string().optional(),
  tools_knowledge: z.string().optional(),
  potential_salary: z.string().optional(),
  passion_for_subject: z.string().optional(),
  skill_match: z.string().optional(),
  professional_associations: z.string().optional(),
  global_applicability: z.string().optional(),
  common_difficulties: z.string().optional(),
  career_opportunities: z.string().optional(),
  intensity: z.string().optional(),
  stress_level: z.string().optional(),
  dropout_rates: z.string().optional(),
  majors_to_consider_switching_to: z.string().optional(),
});

type FormFields = z.infer<typeof formSchema>;

interface MajorFormDialogProps {
  open: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  major?: Major;
}

export function MajorFormDialog({ open, onClose, onSuccess, major }: MajorFormDialogProps) {
  const { toast } = useToast();

  const form = useForm<FormFields>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      description: "",
      featured: false,
      learning_objectives: "",
      common_courses: "",
      interdisciplinary_connections: "",
      job_prospects: "",
      certifications_to_consider: "",
      degree_levels: "",
      affiliated_programs: "",
      gpa_expectations: "",
      transferable_skills: "",
      tools_knowledge: "",
      potential_salary: "",
      passion_for_subject: "",
      skill_match: "",
      professional_associations: "",
      global_applicability: "",
      common_difficulties: "",
      career_opportunities: "",
      intensity: "",
      stress_level: "",
      dropout_rates: "",
      majors_to_consider_switching_to: "",
    },
  });

  useEffect(() => {
    if (major) {
      form.reset({
        title: major.title,
        description: major.description,
        featured: major.featured || false,
        learning_objectives: major.learning_objectives ? major.learning_objectives.join(', ') : '',
        common_courses: major.common_courses ? major.common_courses.join(', ') : '',
        interdisciplinary_connections: major.interdisciplinary_connections ? major.interdisciplinary_connections.join(', ') : '',
        job_prospects: major.job_prospects || '',
        certifications_to_consider: major.certifications_to_consider ? major.certifications_to_consider.join(', ') : '',
        degree_levels: major.degree_levels ? major.degree_levels.join(', ') : '',
        affiliated_programs: major.affiliated_programs ? major.affiliated_programs.join(', ') : '',
        gpa_expectations: major.gpa_expectations ? major.gpa_expectations.toString() : '',
        transferable_skills: major.transferable_skills ? major.transferable_skills.join(', ') : '',
        tools_knowledge: major.tools_knowledge ? major.tools_knowledge.join(', ') : '',
        potential_salary: major.potential_salary || '',
        passion_for_subject: major.passion_for_subject || '',
        skill_match: major.skill_match ? major.skill_match.join(', ') : '',
        professional_associations: major.professional_associations ? major.professional_associations.join(', ') : '',
        global_applicability: major.global_applicability || '',
        common_difficulties: major.common_difficulties ? major.common_difficulties.join(', ') : '',
        career_opportunities: major.career_opportunities ? major.career_opportunities.join(', ') : '',
        intensity: major.intensity || '',
        stress_level: major.stress_level || '',
        dropout_rates: major.dropout_rates || '',
        majors_to_consider_switching_to: major.majors_to_consider_switching_to ? major.majors_to_consider_switching_to.join(', ') : '',
      });
    }
  }, [major, form]);

  const onSubmit = async (data: FormFields) => {
    try {
      console.log("Submitting major form with data:", data);

      // Convert string arrays properly
      const processedData = {
        title: data.title,
        description: data.description,
        featured: data.featured,
        learning_objectives: data.learning_objectives ? data.learning_objectives.split(',').map(s => s.trim()).filter(Boolean) : [],
        common_courses: data.common_courses ? data.common_courses.split(',').map(s => s.trim()).filter(Boolean) : [],
        interdisciplinary_connections: data.interdisciplinary_connections ? data.interdisciplinary_connections.split(',').map(s => s.trim()).filter(Boolean) : [],
        certifications_to_consider: data.certifications_to_consider ? data.certifications_to_consider.split(',').map(s => s.trim()).filter(Boolean) : [],
        degree_levels: data.degree_levels ? data.degree_levels.split(',').map(s => s.trim()).filter(Boolean) : [],
        affiliated_programs: data.affiliated_programs ? data.affiliated_programs.split(',').map(s => s.trim()).filter(Boolean) : [],
        transferable_skills: data.transferable_skills ? data.transferable_skills.split(',').map(s => s.trim()).filter(Boolean) : [],
        tools_knowledge: data.tools_knowledge ? data.tools_knowledge.split(',').map(s => s.trim()).filter(Boolean) : [],
        career_opportunities: data.career_opportunities ? data.career_opportunities.split(',').map(s => s.trim()).filter(Boolean) : [],
        common_difficulties: data.common_difficulties ? data.common_difficulties.split(',').map(s => s.trim()).filter(Boolean) : [],
        majors_to_consider_switching_to: data.majors_to_consider_switching_to ? data.majors_to_consider_switching_to.split(',').map(s => s.trim()).filter(Boolean) : [],
        professional_associations: data.professional_associations ? data.professional_associations.split(',').map(s => s.trim()).filter(Boolean) : [],
        skill_match: data.skill_match ? data.skill_match.split(',').map(s => s.trim()).filter(Boolean) : [],
        job_prospects: data.job_prospects || null,
        gpa_expectations: data.gpa_expectations || null,
        potential_salary: data.potential_salary || null,
        passion_for_subject: data.passion_for_subject || null,
        global_applicability: data.global_applicability || null,
        intensity: data.intensity || null,
        stress_level: data.stress_level || null,
        dropout_rates: data.dropout_rates || null,
        status: "Approved" as const
      };

      console.log("Processed data for submission:", processedData);

      if (major) {
        console.log("Updating existing major:", major.id);
        const { error } = await supabase
          .from('majors')
          .update({
            ...processedData,
            updated_at: new Date().toISOString()
          })
          .eq('id', major.id);

        if (error) throw error;
      } else {
        console.log("Creating new major");
        const { error } = await supabase
          .from('majors')
          .insert([processedData]);

        if (error) {
          console.error("Supabase error:", error);
          throw error;
        }
      }

      toast({
        title: "Success",
        description: `Major ${major ? 'updated' : 'created'} successfully.`
      });

      if (onSuccess) onSuccess();
    } catch (error) {
      console.error('Error saving major:', error);
      toast({
        title: "Error",
        description: "Failed to save major. Please try again.",
        variant: "destructive"
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[700px]">
        <DialogHeader>
          <DialogTitle>{major ? "Edit Major" : "Create New Major"}</DialogTitle>
          <DialogDescription>
            {major ? "Edit the fields below to update the major." : "Enter the details for the new major."}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Title</FormLabel>
                  <FormControl>
                    <Input placeholder="Major Title" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Major Description" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="featured"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-md border p-4">
                  <div className="space-y-0.5">
                    <FormLabel className="text-base">Featured</FormLabel>
                    <FormDescription>
                      Should this major be featured?
                    </FormDescription>
                  </div>
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="learning_objectives"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Learning Objectives</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Enter learning objectives, separated by commas"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="common_courses"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Common Courses</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Enter common courses, separated by commas"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="interdisciplinary_connections"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Interdisciplinary Connections</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Enter interdisciplinary connections, separated by commas"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="job_prospects"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Job Prospects</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter job prospects" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="certifications_to_consider"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Certifications to Consider</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Enter certifications, separated by commas"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="degree_levels"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Degree Levels</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Enter degree levels, separated by commas"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="affiliated_programs"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Affiliated Programs</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Enter affiliated programs, separated by commas"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
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
                      placeholder="Enter GPA expectations"
                      type="number"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="transferable_skills"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Transferable Skills</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Enter transferable skills, separated by commas"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="tools_knowledge"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tools & Knowledge</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Enter tools and knowledge, separated by commas"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="potential_salary"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Potential Salary</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter potential salary" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="passion_for_subject"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Passion for Subject</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter passion level" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="skill_match"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Skill Match</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Enter skill matches, separated by commas"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="professional_associations"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Professional Associations</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Enter professional associations, separated by commas"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="global_applicability"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Global Applicability</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter global applicability" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="common_difficulties"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Common Difficulties</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Enter common difficulties, separated by commas"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="career_opportunities"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Career Opportunities</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Enter career opportunities, separated by commas"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="intensity"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Intensity</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter intensity level" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="stress_level"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Stress Level</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter stress level" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="dropout_rates"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Dropout Rates</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter dropout rates" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="majors_to_consider_switching_to"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Majors to Consider Switching To</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Enter majors to consider switching to, separated by commas"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button type="submit">
                {major ? "Update Major" : "Create Major"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
