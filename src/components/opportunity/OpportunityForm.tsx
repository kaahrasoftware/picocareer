
import { useState } from "react";
import { useForm } from "react-hook-form";
import { OpportunityType } from "@/types/database/enums";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { CalendarIcon, Info } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { FormRichEditor } from "../FormRichEditor";
import { useAuthSession } from "@/hooks/useAuthSession";
import { useUserProfile } from "@/hooks/useUserProfile";

interface OpportunityFormProps {
  initialData?: any;
  onSubmit: (data: any) => void;
  isSubmitting: boolean;
}

const CATEGORIES = [
  "Technology",
  "Healthcare",
  "Education",
  "Finance",
  "Engineering",
  "Marketing",
  "Design",
  "Research",
  "Non-profit",
  "Government",
];

export function OpportunityForm({ initialData, onSubmit, isSubmitting }: OpportunityFormProps) {
  const { session } = useAuthSession();
  const { data: profile } = useUserProfile(session);
  const [description, setDescription] = useState(initialData?.description || "");
  
  const form = useForm({
    defaultValues: {
      title: initialData?.title || "",
      provider_name: initialData?.provider_name || (profile?.full_name || ""),
      opportunity_type: initialData?.opportunity_type || "job",
      location: initialData?.location || "",
      remote: initialData?.remote || false,
      compensation: initialData?.compensation || "",
      application_url: initialData?.application_url || "",
      categories: initialData?.categories || [],
      tags: initialData?.tags || [],
      deadline: initialData?.deadline ? new Date(initialData.deadline) : undefined,
      requirements: initialData?.requirements || {},
      benefits: initialData?.benefits || {},
      eligibility: initialData?.eligibility || {},
    },
  });

  const handleSubmit = (data: any) => {
    if (!description.trim()) {
      return;
    }

    const formattedData = {
      ...data,
      description,
      deadline: data.deadline ? data.deadline.toISOString() : null,
    };

    onSubmit(formattedData);
  };

  const opportunityTypes: { value: OpportunityType; label: string }[] = [
    { value: "job", label: "Job" },
    { value: "internship", label: "Internship" },
    { value: "scholarship", label: "Scholarship" },
    { value: "fellowship", label: "Fellowship" },
    { value: "grant", label: "Grant" },
    { value: "competition", label: "Competition" },
    { value: "event", label: "Event" },
    { value: "other", label: "Other" },
  ];

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-8">
        <FormField
          control={form.control}
          name="title"
          rules={{ required: "Title is required" }}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Opportunity Title</FormLabel>
              <FormControl>
                <Input placeholder="Enter the opportunity title" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="provider_name"
          rules={{ required: "Provider name is required" }}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Provider Name</FormLabel>
              <FormControl>
                <Input placeholder="Enter the company or organization name" {...field} />
              </FormControl>
              <FormDescription>
                The name of the company, organization, or institution offering this opportunity
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="opportunity_type"
          rules={{ required: "Opportunity type is required" }}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Opportunity Type</FormLabel>
              <Select
                onValueChange={field.onChange}
                defaultValue={field.value}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select opportunity type" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {opportunityTypes.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="space-y-2">
          <Label htmlFor="description">Description</Label>
          <FormRichEditor
            value={description}
            onChange={setDescription}
            placeholder="Enter a detailed description of the opportunity..."
          />
          {!description.trim() && (
            <p className="text-sm text-destructive">Description is required</p>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            control={form.control}
            name="location"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Location (Optional)</FormLabel>
                <FormControl>
                  <Input placeholder="E.g., New York, NY" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="remote"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center space-x-3 space-y-0 mt-8">
                <FormControl>
                  <Checkbox
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
                <FormLabel>Remote available</FormLabel>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="compensation"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Compensation (Optional)</FormLabel>
              <FormControl>
                <Input placeholder="E.g., $50,000 - $70,000 per year" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="deadline"
          render={({ field }) => (
            <FormItem className="flex flex-col">
              <FormLabel>Application Deadline (Optional)</FormLabel>
              <Popover>
                <PopoverTrigger asChild>
                  <FormControl>
                    <Button
                      variant={"outline"}
                      className={cn(
                        "w-full pl-3 text-left font-normal",
                        !field.value && "text-muted-foreground"
                      )}
                    >
                      {field.value ? (
                        format(field.value, "PPP")
                      ) : (
                        <span>No deadline</span>
                      )}
                      <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                    </Button>
                  </FormControl>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={field.value}
                    onSelect={field.onChange}
                    disabled={(date) => date < new Date()}
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
              <FormLabel>Application URL (Optional)</FormLabel>
              <FormControl>
                <Input 
                  placeholder="https://example.com/apply" 
                  type="url" 
                  {...field} 
                />
              </FormControl>
              <FormDescription>
                If provided, applicants will be directed to this URL to apply
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            control={form.control}
            name="categories"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Categories (Select up to 3)</FormLabel>
                <div className="space-y-2 border rounded-md p-4 h-60 overflow-y-auto">
                  {CATEGORIES.map((category) => (
                    <div key={category} className="flex items-center space-x-2">
                      <Checkbox
                        id={`category-${category}`}
                        checked={field.value?.includes(category)}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            if (field.value.length < 3) {
                              field.onChange([...field.value, category]);
                            }
                          } else {
                            field.onChange(
                              field.value.filter((val: string) => val !== category)
                            );
                          }
                        }}
                        disabled={!field.value?.includes(category) && field.value?.length >= 3}
                      />
                      <Label htmlFor={`category-${category}`}>{category}</Label>
                    </div>
                  ))}
                </div>
                <FormDescription>
                  Categorize your opportunity to help people find it
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="tags"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Tags (Optional)</FormLabel>
                <FormControl>
                  <Input 
                    placeholder="E.g., remote, entry-level, tech" 
                    onChange={(e) => {
                      const value = e.target.value;
                      field.onChange(
                        value.split(",").map((tag) => tag.trim()).filter(Boolean)
                      );
                    }}
                    value={field.value?.join(", ") || ""}
                  />
                </FormControl>
                <FormDescription>
                  Enter tags separated by commas
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="bg-muted/30 p-6 rounded-lg border">
          <div className="flex items-center gap-2 mb-4">
            <Info className="w-5 h-5 text-muted-foreground" />
            <h3 className="font-medium">Additional Information (Optional)</h3>
          </div>

          {/* Requirements */}
          <div className="mb-6">
            <Label className="mb-2 block">Requirements</Label>
            <div className="space-y-2" id="requirements-container">
              {Array.from({ length: 5 }).map((_, index) => (
                <Input
                  key={`requirement-${index}`}
                  placeholder={`Requirement #${index + 1}`}
                  value={form.watch(`requirements.${index}`) || ""}
                  onChange={(e) => {
                    const requirements = { ...form.watch("requirements") };
                    requirements[index] = e.target.value;
                    form.setValue("requirements", requirements);
                  }}
                />
              ))}
            </div>
          </div>

          {/* Benefits */}
          <div className="mb-6">
            <Label className="mb-2 block">Benefits</Label>
            <div className="space-y-2" id="benefits-container">
              {Array.from({ length: 5 }).map((_, index) => (
                <Input
                  key={`benefit-${index}`}
                  placeholder={`Benefit #${index + 1}`}
                  value={form.watch(`benefits.${index}`) || ""}
                  onChange={(e) => {
                    const benefits = { ...form.watch("benefits") };
                    benefits[index] = e.target.value;
                    form.setValue("benefits", benefits);
                  }}
                />
              ))}
            </div>
          </div>

          {/* Eligibility */}
          <div>
            <Label className="mb-2 block">Eligibility Criteria</Label>
            <div className="space-y-2" id="eligibility-container">
              {Array.from({ length: 5 }).map((_, index) => (
                <Input
                  key={`eligibility-${index}`}
                  placeholder={`Eligibility Requirement #${index + 1}`}
                  value={form.watch(`eligibility.${index}`) || ""}
                  onChange={(e) => {
                    const eligibility = { ...form.watch("eligibility") };
                    eligibility[index] = e.target.value;
                    form.setValue("eligibility", eligibility);
                  }}
                />
              ))}
            </div>
          </div>
        </div>

        <div className="flex justify-end">
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Submitting..." : "Submit Opportunity"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
