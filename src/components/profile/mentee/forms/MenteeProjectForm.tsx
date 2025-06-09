
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { X } from "lucide-react";
import { useMenteeDataMutations } from "@/hooks/useMenteeData";
import type { MenteeProject, ProjectStatus } from "@/types/mentee-profile";

const projectSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
  status: z.enum(["completed", "in_progress", "planned", "on_hold"] as const),
  start_date: z.string().optional(),
  end_date: z.string().optional(),
  github_url: z.string().url().optional().or(z.literal("")),
  live_demo_url: z.string().url().optional().or(z.literal("")),
  technologies: z.string().optional(),
  skills_used: z.string().optional(),
  collaborators: z.string().optional(),
});

type ProjectFormData = z.infer<typeof projectSchema>;

interface MenteeProjectFormProps {
  menteeId: string;
  project?: MenteeProject | null;
  onClose: () => void;
}

export function MenteeProjectForm({ menteeId, project, onClose }: MenteeProjectFormProps) {
  const { addProject, updateProject } = useMenteeDataMutations();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<ProjectFormData>({
    resolver: zodResolver(projectSchema),
    defaultValues: {
      title: project?.title || "",
      description: project?.description || "",
      status: project?.status || "completed",
      start_date: project?.start_date || "",
      end_date: project?.end_date || "",
      github_url: project?.github_url || "",
      live_demo_url: project?.live_demo_url || "",
      technologies: project?.technologies?.join(", ") || "",
      skills_used: project?.skills_used?.join(", ") || "",
      collaborators: project?.collaborators?.join(", ") || "",
    },
  });

  const onSubmit = async (data: ProjectFormData) => {
    setIsSubmitting(true);
    try {
      const projectData = {
        ...data,
        mentee_id: menteeId,
        technologies: data.technologies ? data.technologies.split(",").map(t => t.trim()).filter(Boolean) : [],
        skills_used: data.skills_used ? data.skills_used.split(",").map(s => s.trim()).filter(Boolean) : [],
        collaborators: data.collaborators ? data.collaborators.split(",").map(c => c.trim()).filter(Boolean) : [],
        start_date: data.start_date || null,
        end_date: data.end_date || null,
        github_url: data.github_url || null,
        live_demo_url: data.live_demo_url || null,
      };

      if (project) {
        await updateProject.mutateAsync({ id: project.id, ...projectData });
      } else {
        await addProject.mutateAsync(projectData);
      }
      onClose();
    } catch (error) {
      console.error("Error saving project:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{project ? "Edit Project" : "Add Project"}</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Project Title *</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Enter project title" />
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
                    <Textarea {...field} placeholder="Describe your project" rows={3} />
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
                      <SelectItem value="completed">Completed</SelectItem>
                      <SelectItem value="in_progress">In Progress</SelectItem>
                      <SelectItem value="planned">Planned</SelectItem>
                      <SelectItem value="on_hold">On Hold</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="start_date"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Start Date</FormLabel>
                    <FormControl>
                      <Input {...field} type="date" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="end_date"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>End Date</FormLabel>
                    <FormControl>
                      <Input {...field} type="date" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="technologies"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Technologies Used</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="React, TypeScript, Node.js (comma separated)" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="skills_used"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Skills Used</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Frontend Development, API Design (comma separated)" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="collaborators"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Collaborators</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="John Doe, Jane Smith (comma separated)" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="github_url"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>GitHub URL</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="https://github.com/username/project" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="live_demo_url"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Live Demo URL</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="https://myproject.com" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end gap-2 pt-4">
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Saving..." : project ? "Update Project" : "Add Project"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
