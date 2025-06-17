
import { useState } from "react";
import { useForm } from "react-hook-form";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Major } from "@/types/database/majors";

interface MajorFormDialogProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  major?: Major | null;
}

interface MajorFormData {
  title: string;
  description: string;
  featured: boolean;
  learning_objectives: string;
  common_courses: string;
  interdisciplinary_connections: string;
  job_prospects: string;
  certifications_to_consider: string;
  degree_levels: string;
  affiliated_programs: string;
  gpa_expectations: number | null;
  transferable_skills: string;
  tools_knowledge: string;
  potential_salary: string;
  passion_for_subject: string;
  skill_match: string;
  professional_associations: string;
  global_applicability: string;
  common_difficulties: string;
  career_opportunities: string;
  intensity: string;
  stress_level: string;
  dropout_rates: string;
  majors_to_consider_switching_to: string;
}

export function MajorFormDialog({ open, onClose, onSuccess, major }: MajorFormDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const form = useForm<MajorFormData>({
    defaultValues: {
      title: major?.title || "",
      description: major?.description || "",
      featured: major?.featured || false,
      learning_objectives: major?.learning_objectives?.join('\n') || "",
      common_courses: major?.common_courses?.join('\n') || "",
      interdisciplinary_connections: major?.interdisciplinary_connections?.join('\n') || "",
      job_prospects: major?.job_prospects || "",
      certifications_to_consider: major?.certifications_to_consider?.join('\n') || "",
      degree_levels: major?.degree_levels?.join('\n') || "",
      affiliated_programs: major?.affiliated_programs?.join('\n') || "",
      gpa_expectations: major?.gpa_expectations || null,
      transferable_skills: major?.transferable_skills?.join('\n') || "",
      tools_knowledge: major?.tools_knowledge?.join('\n') || "",
      potential_salary: major?.potential_salary || "",
      passion_for_subject: major?.passion_for_subject || "",
      skill_match: major?.skill_match?.join('\n') || "",
      professional_associations: major?.professional_associations?.join('\n') || "",
      global_applicability: major?.global_applicability || "",
      common_difficulties: major?.common_difficulties?.join('\n') || "",
      career_opportunities: major?.career_opportunities?.join('\n') || "",
      intensity: major?.intensity || "",
      stress_level: major?.stress_level || "",
      dropout_rates: major?.dropout_rates || "",
      majors_to_consider_switching_to: major?.majors_to_consider_switching_to?.join('\n') || "",
    },
  });

  const convertFormDataToMajor = (data: MajorFormData) => {
    return {
      title: data.title,
      description: data.description,
      featured: data.featured,
      learning_objectives: data.learning_objectives ? data.learning_objectives.split('\n').filter(item => item.trim()) : [],
      common_courses: data.common_courses ? data.common_courses.split('\n').filter(item => item.trim()) : [],
      interdisciplinary_connections: data.interdisciplinary_connections ? data.interdisciplinary_connections.split('\n').filter(item => item.trim()) : [],
      job_prospects: data.job_prospects || null,
      certifications_to_consider: data.certifications_to_consider ? data.certifications_to_consider.split('\n').filter(item => item.trim()) : [],
      degree_levels: data.degree_levels ? data.degree_levels.split('\n').filter(item => item.trim()) : [],
      affiliated_programs: data.affiliated_programs ? data.affiliated_programs.split('\n').filter(item => item.trim()) : [],
      gpa_expectations: data.gpa_expectations,
      transferable_skills: data.transferable_skills ? data.transferable_skills.split('\n').filter(item => item.trim()) : [],
      tools_knowledge: data.tools_knowledge ? data.tools_knowledge.split('\n').filter(item => item.trim()) : [],
      potential_salary: data.potential_salary || null,
      passion_for_subject: data.passion_for_subject || null,
      skill_match: data.skill_match ? data.skill_match.split('\n').filter(item => item.trim()) : [],
      professional_associations: data.professional_associations ? data.professional_associations.split('\n').filter(item => item.trim()) : [],
      global_applicability: data.global_applicability || null,
      common_difficulties: data.common_difficulties ? data.common_difficulties.split('\n').filter(item => item.trim()) : [],
      career_opportunities: data.career_opportunities ? data.career_opportunities.split('\n').filter(item => item.trim()) : [],
      intensity: data.intensity || null,
      stress_level: data.stress_level || null,
      dropout_rates: data.dropout_rates || null,
      majors_to_consider_switching_to: data.majors_to_consider_switching_to ? data.majors_to_consider_switching_to.split('\n').filter(item => item.trim()) : [],
    };
  };

  const onSubmit = async (data: MajorFormData) => {
    setIsSubmitting(true);
    try {
      const majorData = convertFormDataToMajor(data);

      if (major?.id) {
        // Update existing major
        const { error } = await supabase
          .from("majors")
          .update(majorData)
          .eq("id", major.id);

        if (error) throw error;

        toast({
          title: "Major updated",
          description: "The major has been successfully updated.",
        });
      } else {
        // Create new major
        const { error } = await supabase
          .from("majors")
          .insert([majorData]);

        if (error) throw error;

        toast({
          title: "Major created",
          description: "The major has been successfully created.",
        });
      }

      onSuccess();
      onClose();
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

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {major ? "Edit Major" : "Create New Major"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Title *</Label>
            <Input
              id="title"
              {...form.register("title", { required: true })}
              placeholder="Enter major title"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description *</Label>
            <Textarea
              id="description"
              {...form.register("description", { required: true })}
              placeholder="Enter major description"
              rows={3}
            />
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="featured"
              checked={form.watch("featured")}
              onCheckedChange={(checked) => form.setValue("featured", checked as boolean)}
            />
            <Label htmlFor="featured">Featured</Label>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="learning_objectives">Learning Objectives (one per line)</Label>
              <Textarea
                id="learning_objectives"
                {...form.register("learning_objectives")}
                placeholder="Enter learning objectives, one per line"
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="common_courses">Common Courses (one per line)</Label>
              <Textarea
                id="common_courses"
                {...form.register("common_courses")}
                placeholder="Enter common courses, one per line"
                rows={3}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="job_prospects">Job Prospects</Label>
            <Textarea
              id="job_prospects"
              {...form.register("job_prospects")}
              placeholder="Enter job prospects information"
              rows={2}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="potential_salary">Potential Salary</Label>
            <Input
              id="potential_salary"
              {...form.register("potential_salary")}
              placeholder="e.g., $50,000 - $80,000"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="gpa_expectations">GPA Expectations</Label>
            <Input
              id="gpa_expectations"
              type="number"
              step="0.1"
              min="0"
              max="4"
              {...form.register("gpa_expectations", { valueAsNumber: true })}
              placeholder="e.g., 3.5"
            />
          </div>

          <div className="flex justify-end gap-3">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Saving..." : major ? "Update Major" : "Create Major"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
