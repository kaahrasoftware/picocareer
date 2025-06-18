import React from 'react';
import { useForm, Controller } from 'react-hook-form';
import { Form } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { FormField } from "@/components/forms/FormField";
import { useToast } from "@/hooks/use-toast";
import { useAuthSession } from "@/hooks/useAuthSession";
import { useUserProfile } from "@/hooks/useUserProfile";
import { useParams, useNavigate } from 'react-router-dom';

interface FormFields {
  title: string;
  description: string;
  status: 'in_progress' | 'completed' | 'on_hold';
  technologies: string | string[];
  skills_used: string | string[];
  collaborators: string | string[];
  start_date: string;
  end_date: string;
  github_url: string;
  live_demo_url: string;
}

interface MenteeProjectFormProps {
  menteeId: string;
  project?: MenteeProject;
  onClose: () => void;
}

export function MenteeProjectForm({ menteeId, project, onClose }: MenteeProjectFormProps) {
  const { toast } = useToast();
  const { session } = useAuthSession();
  const { data: profile } = useUserProfile(session);
  const { menteeId: paramMenteeId } = useParams<{ menteeId: string }>();
  const navigate = useNavigate();

  const form = useForm<FormFields>({
    defaultValues: {
      title: "",
      description: "",
      status: "in_progress",
      technologies: "",
      skills_used: "",
      collaborators: "",
      start_date: "",
      end_date: "",
      github_url: "",
      live_demo_url: ""
    }
  });

  const onSubmit = async (data: FormFields) => {
    if (!profile?.id || !paramMenteeId) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to submit the form.",
        variant: "destructive",
      });
      return;
    }

    try {
      const formData = {
        mentee_id: paramMenteeId,
        title: data.title || '', // Make sure title is required
        description: data.description || '',
        status: data.status || 'in_progress',
        technologies: Array.isArray(data.technologies) ? data.technologies : 
                     typeof data.technologies === 'string' ? data.technologies.split(',').map(t => t.trim()) : [],
        skills_used: Array.isArray(data.skills_used) ? data.skills_used : 
                    typeof data.skills_used === 'string' ? data.skills_used.split(',').map(s => s.trim()) : [],
        collaborators: Array.isArray(data.collaborators) ? data.collaborators : 
                      typeof data.collaborators === 'string' ? data.collaborators.split(',').map(c => c.trim()) : [],
        start_date: data.start_date || '',
        end_date: data.end_date || '',
        github_url: data.github_url || '',
        live_demo_url: data.live_demo_url || ''
      };

      console.log("Form Data:", formData);

      toast({
        title: "Success",
        description: "Project details submitted successfully!",
      });

      navigate(`/profile/${paramMenteeId}`);
    } catch (error) {
      console.error("Form submission error:", error);
      toast({
        title: "Error",
        description: "Failed to submit project details. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <Controller
          control={form.control}
          name="title"
          rules={{ required: "Title is required" }}
          render={({ field }) => (
            <FormField
              name="title"
              field={field}
              label="Project Title"
              type="text"
              placeholder="Enter project title"
              required
            />
          )}
        />

        <Controller
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormField
              name="description"
              field={field}
              label="Description"
              type="textarea"
              placeholder="Enter project description"
            />
          )}
        />

        <Controller
          control={form.control}
          name="status"
          render={({ field }) => (
            <FormField
              name="status"
              field={field}
              label="Status"
              type="select"
              options={[
                { value: "in_progress", label: "In Progress" },
                { value: "completed", label: "Completed" },
                { value: "on_hold", label: "On Hold" },
              ]}
            />
          )}
        />

        <Controller
          control={form.control}
          name="technologies"
          render={({ field }) => (
            <FormField
              name="technologies"
              field={field}
              label="Technologies Used"
              type="text"
              placeholder="Enter technologies used (comma-separated)"
            />
          )}
        />

        <Controller
          control={form.control}
          name="skills_used"
          render={({ field }) => (
            <FormField
              name="skills_used"
              field={field}
              label="Skills Used"
              type="text"
              placeholder="Enter skills used (comma-separated)"
            />
          )}
        />

        <Controller
          control={form.control}
          name="collaborators"
          render={({ field }) => (
            <FormField
              name="collaborators"
              field={field}
              label="Collaborators"
              type="text"
              placeholder="Enter collaborators (comma-separated)"
            />
          )}
        />

        <Controller
          control={form.control}
          name="start_date"
          render={({ field }) => (
            <FormField
              name="start_date"
              field={field}
              label="Start Date"
              type="text"
              placeholder="YYYY-MM-DD"
            />
          )}
        />

        <Controller
          control={form.control}
          name="end_date"
          render={({ field }) => (
            <FormField
              name="end_date"
              field={field}
              label="End Date"
              type="text"
              placeholder="YYYY-MM-DD"
            />
          )}
        />

        <Controller
          control={form.control}
          name="github_url"
          render={({ field }) => (
            <FormField
              name="github_url"
              field={field}
              label="GitHub URL"
              type="url"
              placeholder="Enter GitHub URL"
            />
          )}
        />

        <Controller
          control={form.control}
          name="live_demo_url"
          render={({ field }) => (
            <FormField
              name="live_demo_url"
              field={field}
              label="Live Demo URL"
              type="url"
              placeholder="Enter live demo URL"
            />
          )}
        />

        <Button type="submit" disabled={form.formState.isSubmitting}>
          {form.formState.isSubmitting ? "Submitting..." : "Submit"}
        </Button>
      </form>
    </Form>
  );
}
