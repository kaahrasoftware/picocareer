import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { FormField } from "@/components/forms/FormField";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer"
import { Plus } from "lucide-react";
import { Editor } from "@/components/ui/editor";
import { MultiSelect } from "./fields/MultiSelect";
import { useAuthSession } from "@/hooks/useAuthSession";
import { useNavigate } from "react-router-dom";

const formSchema = z.object({
  title: z.string().min(2, {
    message: "Title must be at least 2 characters.",
  }),
  description: z.string().min(10, {
    message: "Description must be at least 10 characters.",
  }),
  content_type: z.string().min(1, {
    message: "Content type is required.",
  }),
  resource_type: z.string().min(1, {
    message: "Resource type is required.",
  }),
  url: z.string().url({
    message: "Please enter a valid URL.",
  }),
  careers: z.array(z.string()).min(1, {
    message: "At least one career must be selected.",
  }),
  majors: z.array(z.string()).min(1, {
    message: "At least one major must be selected.",
  }),
  schools: z.array(z.string()).min(1, {
    message: "At least one school must be selected.",
  }),
  premium: z.boolean().default(false).optional(),
  status: z.string().optional(),
  content: z.string().optional(),
});

export function ResourceForm() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [open, setOpen] = useState(false);
  const { session } = useAuthSession();
  const navigate = useNavigate();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      description: "",
      content_type: "",
      resource_type: "",
      url: "",
      careers: [],
      majors: [],
      schools: [],
      premium: false,
      status: "Draft",
      content: "",
    },
  });

  // Fetch careers for the dropdown
  const { data: careers = [] } = useQuery({
    queryKey: ['careers'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('careers')
        .select('id, title')
        .eq('status', 'Approved')
        .order('title');
      
      if (error) throw error;
      return data || [];
    }
  });

  // Fetch majors for the dropdown
  const { data: majors = [] } = useQuery({
    queryKey: ['majors'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('majors')
        .select('id, title')
        .eq('status', 'Approved')
        .order('title');
      
      if (error) throw error;
      return data || [];
    }
  });

  // Fetch schools for the dropdown
  const { data: schools = [] } = useQuery({
    queryKey: ['schools'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('schools')
        .select('id, name')
        .eq('status', 'Approved')
        .order('name');
      
      if (error) throw error;
      return data || [];
    }
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setIsSubmitting(true);
    try {
      const { error } = await supabase
        .from('resources')
        .insert({
          ...values,
          admin_id: session?.user?.id,
          careers: values.careers as any,
          majors: values.majors as any,
          schools: values.schools as any,
        });

      if (error) throw error;

      toast.success("Resource created successfully!");
      form.reset();
      navigate('/hub/resources');
    } catch (error) {
      console.error('Resource creation error:', error);
      toast.error("Resource creation failed. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const contentTypeOptions = [
    { value: "Article", label: "Article" },
    { value: "Video", label: "Video" },
    { value: "Podcast", label: "Podcast" },
    { value: "Infographic", label: "Infographic" },
    { value: "Template", label: "Template" },
    { value: "Tool", label: "Tool" },
    { value: "Course", label: "Course" },
    { value: "Event", label: "Event" },
    { value: "Other", label: "Other" },
  ];

  const resourceTypeOptions = [
    { value: "Informational", label: "Informational" },
    { value: "Educational", label: "Educational" },
    { value: "Inspirational", label: "Inspirational" },
    { value: "Practical", label: "Practical" },
    { value: "Entertaining", label: "Entertaining" },
  ];

  const statusOptions = [
    { value: "Draft", label: "Draft" },
    { value: "Pending Approval", label: "Pending Approval" },
    { value: "Approved", label: "Approved" },
    { value: "Rejected", label: "Rejected" },
  ];

  const formattedMajors = majors.map(major => ({ value: major.id, label: major.title }));
  const formattedSchools = schools.map(school => ({ value: school.id, label: school.name }));

  return (
    <>
      <Drawer open={open} onOpenChange={setOpen}>
        <DrawerTrigger asChild>
          <Button variant="outline" className="ml-auto">
            <Plus className="h-4 w-4 mr-2" />
            Create Resource
          </Button>
        </DrawerTrigger>
        <DrawerContent>
          <DrawerHeader>
            <DrawerTitle>Create a new resource</DrawerTitle>
            <DrawerDescription>
              Add a new resource to the platform.
            </DrawerDescription>
          </DrawerHeader>
          <div className="px-6 pb-4">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="title"
                  label="Title"
                  type="text"
                  placeholder="Enter the title of the resource"
                  required
                />

                <FormField
                  control={form.control}
                  name="description"
                  label="Description"
                  type="textarea"
                  placeholder="Enter a brief description of the resource"
                  required
                />

                <FormField
                  control={form.control}
                  name="content_type"
                  label="Content Type"
                  type="select"
                  placeholder="Select the content type"
                  options={contentTypeOptions}
                  required
                />

                <FormField
                  control={form.control}
                  name="resource_type"
                  label="Resource Type"
                  type="select"
                  placeholder="Select the resource type"
                  options={resourceTypeOptions}
                  required
                />

                <FormField
                  control={form.control}
                  name="url"
                  label="URL"
                  type="url"
                  placeholder="Enter the URL of the resource"
                  required
                />

                <FormField
                  control={form.control}
                  name="careers"
                  label="Careers"
                  type="select"
                  placeholder="Select careers"
                  options={careers.map(career => ({ value: career.id, label: career.title }))}
                  required
                  component={MultiSelect}
                />

                <FormField
                  control={form.control}
                  name="majors"
                  label="Majors"
                  type="select"
                  placeholder="Select majors"
                  options={formattedMajors}
                  required
                  component={MultiSelect}
                />

                <FormField
                  control={form.control}
                  name="schools"
                  label="Schools"
                  type="select"
                  placeholder="Select schools"
                  options={formattedSchools}
                  required
                  component={MultiSelect}
                />

                <FormField
                  control={form.control}
                  name="premium"
                  label="Premium"
                  type="checkbox"
                />

                <FormField
                  control={form.control}
                  name="status"
                  label="Status"
                  type="select"
                  placeholder="Select status"
                  options={statusOptions}
                />

                <FormField
                  control={form.control}
                  name="content"
                  label="Content"
                >
                  <Editor
                    onChange={(value) => form.setValue("content", value)}
                  />
                </FormField>

                <DrawerFooter>
                  <Button type="submit" disabled={isSubmitting} className="w-full">
                    {isSubmitting ? "Submitting..." : "Create Resource"}
                  </Button>
                </DrawerFooter>
              </form>
            </Form>
          </div>
        </DrawerContent>
      </Drawer>
    </>
  );
}
