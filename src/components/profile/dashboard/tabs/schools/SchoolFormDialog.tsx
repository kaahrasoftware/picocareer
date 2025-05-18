
import { useState } from "react";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { ImageUpload } from "@/components/forms/ImageUpload";
import { School, SchoolStatus, SchoolType } from "@/types/database/schools";
import { BasicInputField } from "@/components/forms/fields/BasicInputField";
import { Loader2 } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";

// Define the form schema with Zod
const schoolFormSchema = z.object({
  name: z.string().min(1, { message: "Name is required" }),
  type: z.enum(["University", "College", "High School", "Other"]),
  location: z.string().optional(),
  country: z.string().min(1, { message: "Country is required" }),
  state: z.string().optional(),
  website: z.string().url({ message: "Must be a valid URL" }).optional().or(z.literal("")),
  status: z.enum(["Approved", "Pending", "Rejected"]),
  logo_url: z.string().optional(),
  cover_image_url: z.string().optional(),
  undergraduate_application_url: z.string().url({ message: "Must be a valid URL" }).optional().or(z.literal("")),
  graduate_application_url: z.string().url({ message: "Must be a valid URL" }).optional().or(z.literal("")),
  admissions_page_url: z.string().url({ message: "Must be a valid URL" }).optional().or(z.literal("")),
  international_students_url: z.string().url({ message: "Must be a valid URL" }).optional().or(z.literal("")),
  financial_aid_url: z.string().url({ message: "Must be a valid URL" }).optional().or(z.literal("")),
  virtual_tour_url: z.string().url({ message: "Must be a valid URL" }).optional().or(z.literal("")),
  ranking: z.string().optional(),
  acceptance_rate: z.number().min(0).max(1).optional().nullable(),
  student_population: z.number().int().positive().optional().nullable(),
  student_faculty_ratio: z.string().optional(),
});

type SchoolFormValues = z.infer<typeof schoolFormSchema>;

interface SchoolFormDialogProps {
  open: boolean;
  onClose: () => void;
  mode: "add" | "edit";
  school?: School;
}

export function SchoolFormDialog({ open, onClose, mode, school }: SchoolFormDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  // Set default values based on mode
  const defaultValues: Partial<SchoolFormValues> = mode === "edit" && school
    ? {
        name: school.name,
        type: school.type,
        location: school.location || "",
        country: school.country,
        state: school.state || "",
        website: school.website || "",
        status: school.status,
        logo_url: school.logo_url || "",
        cover_image_url: school.cover_image_url || "",
        undergraduate_application_url: school.undergraduate_application_url || "",
        graduate_application_url: school.graduate_application_url || "",
        admissions_page_url: school.admissions_page_url || "",
        international_students_url: school.international_students_url || "",
        financial_aid_url: school.financial_aid_url || "",
        virtual_tour_url: school.virtual_tour_url || "",
        ranking: school.ranking || "",
        acceptance_rate: school.acceptance_rate !== null ? school.acceptance_rate : null,
        student_population: school.student_population !== null ? school.student_population : null,
        student_faculty_ratio: school.student_faculty_ratio || "",
      }
    : {
        name: "",
        type: "University",
        location: "",
        country: "",
        state: "",
        website: "",
        status: "Pending",
        logo_url: "",
        cover_image_url: "",
        undergraduate_application_url: "",
        graduate_application_url: "",
        admissions_page_url: "",
        international_students_url: "",
        financial_aid_url: "",
        virtual_tour_url: "",
        ranking: "",
        acceptance_rate: null,
        student_population: null,
        student_faculty_ratio: "",
      };

  const form = useForm<SchoolFormValues>({
    resolver: zodResolver(schoolFormSchema),
    defaultValues,
  });

  const handleSubmit = async (values: SchoolFormValues) => {
    setIsSubmitting(true);

    try {
      if (mode === "add") {
        const { error } = await supabase.from("schools").insert([values]);
        if (error) throw error;
        toast({
          title: "School added",
          description: "The school has been successfully added.",
        });
      } else if (mode === "edit" && school) {
        const { error } = await supabase
          .from("schools")
          .update(values)
          .eq("id", school.id);
        if (error) throw error;
        toast({
          title: "School updated",
          description: "The school has been successfully updated.",
        });
      }
      onClose();
    } catch (error) {
      console.error("Error submitting school:", error);
      toast({
        title: "Error",
        description: "Failed to save school. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {mode === "add" ? "Add New School" : `Edit School: ${school?.name}`}
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-6">
                <h3 className="text-lg font-medium">Basic Information</h3>
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Name*</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="type"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Type*</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="University">University</SelectItem>
                          <SelectItem value="College">College</SelectItem>
                          <SelectItem value="High School">High School</SelectItem>
                          <SelectItem value="Other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="status"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Status*</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
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

                <FormField
                  control={form.control}
                  name="country"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Country*</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="state"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>State/Province</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="location"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Location (City)</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="website"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Website URL</FormLabel>
                      <FormControl>
                        <Input {...field} type="url" placeholder="https://" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="space-y-6">
                <h3 className="text-lg font-medium">Media & Brand</h3>
                <FormField
                  control={form.control}
                  name="logo_url"
                  render={({ field }) => (
                    <ImageUpload
                      control={form.control}
                      name="logo_url"
                      label="School Logo"
                      description="Upload a logo for the school (square format recommended)"
                      bucket="schools"
                      accept="image/*"
                      onUploadSuccess={field.onChange}
                      folderPath="logos"
                    />
                  )}
                />

                <FormField
                  control={form.control}
                  name="cover_image_url"
                  render={({ field }) => (
                    <ImageUpload
                      control={form.control}
                      name="cover_image_url"
                      label="Cover Image"
                      description="Upload a cover image for the school"
                      bucket="schools"
                      accept="image/*"
                      onUploadSuccess={field.onChange}
                      folderPath="covers"
                    />
                  )}
                />

                <h3 className="text-lg font-medium mt-8">Statistics</h3>
                <FormField
                  control={form.control}
                  name="ranking"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Ranking</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="e.g., #15 National" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="acceptance_rate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Acceptance Rate (0-1)</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          step="0.01"
                          min="0"
                          max="1"
                          value={field.value === null ? '' : field.value}
                          onChange={(e) => field.onChange(e.target.value === '' ? null : parseFloat(e.target.value))}
                          placeholder="e.g., 0.15 for 15%"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="student_population"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Student Population</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          value={field.value === null ? '' : field.value}
                          onChange={(e) => field.onChange(e.target.value === '' ? null : parseInt(e.target.value, 10))}
                          placeholder="e.g., 25000"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="student_faculty_ratio"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Student-Faculty Ratio</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="e.g., 16:1" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-medium">Important URLs</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="undergraduate_application_url"
                  render={({ field }) => (
                    <BasicInputField
                      field={field}
                      label="Undergraduate Application URL"
                      placeholder="https://"
                      type="text"
                    />
                  )}
                />

                <FormField
                  control={form.control}
                  name="graduate_application_url"
                  render={({ field }) => (
                    <BasicInputField
                      field={field}
                      label="Graduate Application URL"
                      placeholder="https://"
                      type="text"
                    />
                  )}
                />

                <FormField
                  control={form.control}
                  name="admissions_page_url"
                  render={({ field }) => (
                    <BasicInputField
                      field={field}
                      label="Admissions Page URL"
                      placeholder="https://"
                      type="text"
                    />
                  )}
                />

                <FormField
                  control={form.control}
                  name="international_students_url"
                  render={({ field }) => (
                    <BasicInputField
                      field={field}
                      label="International Students URL"
                      placeholder="https://"
                      type="text"
                    />
                  )}
                />

                <FormField
                  control={form.control}
                  name="financial_aid_url"
                  render={({ field }) => (
                    <BasicInputField
                      field={field}
                      label="Financial Aid URL"
                      placeholder="https://"
                      type="text"
                    />
                  )}
                />

                <FormField
                  control={form.control}
                  name="virtual_tour_url"
                  render={({ field }) => (
                    <BasicInputField
                      field={field}
                      label="Virtual Tour URL"
                      placeholder="https://"
                      type="text"
                    />
                  )}
                />
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={onClose} type="button" disabled={isSubmitting}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    <span>Saving...</span>
                  </>
                ) : mode === "add" ? (
                  "Add School"
                ) : (
                  "Save Changes"
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
