
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { X, Plus, CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { useAuthState } from "@/hooks/useAuthState";

// Predefined scholarship categories
const SCHOLARSHIP_CATEGORIES = [
  "Academic Excellence",
  "Athletic",
  "Community Service",
  "STEM",
  "Arts",
  "First Generation",
  "Minority",
  "Women",
  "International",
  "Military",
  "Study Abroad",
  "Graduate",
  "Undergraduate",
  "Merit-Based",
  "Need-Based",
  "Research",
];

const scholarshipSchema = z.object({
  title: z.string().min(5, "Title must be at least 5 characters"),
  description: z.string().min(20, "Description must be at least 20 characters"),
  provider_name: z.string().min(2, "Provider name is required"),
  amount: z.union([z.number().positive(), z.null()]).optional(),
  deadline: z.date().optional(),
  status: z.enum(["Active", "Expired", "Coming Soon"]),
  application_url: z.string().url("Must be a valid URL").optional().or(z.literal("")),
  application_open_date: z.date().optional(),
  application_process: z.string().optional(),
  award_frequency: z.string().optional(),
  renewable: z.boolean().default(false),
  contact_information: z.object({
    email: z.string().email("Must be a valid email").optional().or(z.literal("")),
    phone: z.string().optional(),
    website: z.string().url("Must be a valid URL").optional().or(z.literal("")),
  }).optional(),
});

type ScholarshipFormValues = z.infer<typeof scholarshipSchema>;

interface ScholarshipFormProps {
  scholarship?: any; // The scholarship to edit, if any
}

export function ScholarshipForm({ scholarship }: ScholarshipFormProps) {
  const { toast } = useToast();
  const navigate = useNavigate();
  const { user } = useAuthState();
  const [tags, setTags] = useState<string[]>(scholarship?.tags || []);
  const [categories, setCategories] = useState<string[]>(scholarship?.category || []);
  const [tagInput, setTagInput] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<ScholarshipFormValues>({
    resolver: zodResolver(scholarshipSchema),
    defaultValues: {
      title: scholarship?.title || "",
      description: scholarship?.description || "",
      provider_name: scholarship?.provider_name || "",
      amount: scholarship?.amount || null,
      deadline: scholarship?.deadline ? new Date(scholarship.deadline) : undefined,
      status: scholarship?.status || "Active",
      application_url: scholarship?.application_url || "",
      application_open_date: scholarship?.application_open_date
        ? new Date(scholarship.application_open_date)
        : undefined,
      application_process: scholarship?.application_process || "",
      award_frequency: scholarship?.award_frequency || "",
      renewable: scholarship?.renewable || false,
      contact_information: scholarship?.contact_information || {
        email: "",
        phone: "",
        website: "",
      },
    },
  });

  const handleAddTag = () => {
    if (tagInput && !tags.includes(tagInput)) {
      setTags([...tags, tagInput]);
      setTagInput("");
    }
  };

  const handleRemoveTag = (tag: string) => {
    setTags(tags.filter((t) => t !== tag));
  };

  const handleCategorySelect = (category: string) => {
    if (!categories.includes(category)) {
      setCategories([...categories, category]);
    } else {
      setCategories(categories.filter((c) => c !== category));
    }
  };

  const onSubmit = async (data: ScholarshipFormValues) => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "You must be signed in to submit a scholarship.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const scholarshipData = {
        ...data,
        category: categories,
        tags,
        author_id: user.id,
      };

      let response;

      if (scholarship) {
        // Update existing scholarship
        response = await supabase
          .from("scholarships")
          .update(scholarshipData)
          .eq("id", scholarship.id);
      } else {
        // Create new scholarship
        response = await supabase.from("scholarships").insert(scholarshipData);
      }

      if (response.error) {
        throw response.error;
      }

      toast({
        title: scholarship ? "Scholarship updated" : "Scholarship created",
        description: scholarship
          ? "The scholarship has been successfully updated."
          : "Your scholarship has been successfully submitted.",
      });

      navigate("/scholarships");
    } catch (error: any) {
      console.error("Error submitting scholarship:", error);
      toast({
        title: "Submission failed",
        description: error.message || "An unexpected error occurred.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-6 md:col-span-2">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Scholarship Title*</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter scholarship title" {...field} />
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
                  <FormLabel>Description*</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Describe the scholarship"
                      className="min-h-32"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name="provider_name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Provider Name*</FormLabel>
                <FormControl>
                  <Input placeholder="Name of the organization" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="amount"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Amount</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    placeholder="Scholarship amount in USD"
                    {...field}
                    onChange={(e) => {
                      const value = e.target.value;
                      field.onChange(value === "" ? null : parseFloat(value));
                    }}
                    value={field.value === null ? "" : field.value}
                  />
                </FormControl>
                <FormDescription>Leave empty if amount varies</FormDescription>
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
                    <SelectItem value="Active">Active</SelectItem>
                    <SelectItem value="Coming Soon">Coming Soon</SelectItem>
                    <SelectItem value="Expired">Expired</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="deadline"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Application Deadline</FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant="outline"
                        className={`w-full justify-start text-left font-normal ${
                          !field.value ? "text-muted-foreground" : ""
                        }`}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {field.value ? (
                          format(field.value, "PPP")
                        ) : (
                          "Select deadline date"
                        )}
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={field.value}
                      onSelect={field.onChange}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="application_url"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Application URL</FormLabel>
                <FormControl>
                  <Input
                    placeholder="https://example.com/apply"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="renewable"
            render={({ field }) => (
              <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                <FormControl>
                  <input
                    type="checkbox"
                    checked={field.value}
                    onChange={field.onChange}
                    className="h-4 w-4 mt-1"
                  />
                </FormControl>
                <div className="space-y-1 leading-none">
                  <FormLabel>Renewable</FormLabel>
                  <FormDescription>
                    Can this scholarship be renewed for multiple years?
                  </FormDescription>
                </div>
              </FormItem>
            )}
          />

          <div className="md:col-span-2">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-lg font-medium mb-2">Categories</h3>
                <p className="text-sm text-muted-foreground mb-3">
                  Select categories that apply to this scholarship
                </p>
                <div className="flex flex-wrap gap-2 mb-4">
                  {categories.map((category) => (
                    <Badge
                      key={category}
                      variant="outline"
                      className="bg-blue-50 hover:bg-blue-100"
                    >
                      {category}
                      <button
                        type="button"
                        onClick={() => handleCategorySelect(category)}
                        className="ml-1 text-muted-foreground hover:text-foreground"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {SCHOLARSHIP_CATEGORIES.map((category) => (
                    <Button
                      key={category}
                      type="button"
                      variant={categories.includes(category) ? "default" : "outline"}
                      size="sm"
                      className="justify-start"
                      onClick={() => handleCategorySelect(category)}
                    >
                      {category}
                    </Button>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="text-lg font-medium mb-2">Tags</h3>
                <p className="text-sm text-muted-foreground mb-3">
                  Add tags to help students find this scholarship
                </p>
                <div className="flex flex-wrap gap-2 mb-4">
                  {tags.map((tag) => (
                    <Badge
                      key={tag}
                      variant="secondary"
                      className="bg-gray-100 text-gray-800"
                    >
                      {tag}
                      <button
                        type="button"
                        onClick={() => handleRemoveTag(tag)}
                        className="ml-1 text-muted-foreground hover:text-foreground"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
                <div className="flex gap-2">
                  <Input
                    placeholder="Add a tag"
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        handleAddTag();
                      }
                    }}
                  />
                  <Button type="button" onClick={handleAddTag} variant="outline">
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate("/scholarships")}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Submitting..." : scholarship ? "Update Scholarship" : "Create Scholarship"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
