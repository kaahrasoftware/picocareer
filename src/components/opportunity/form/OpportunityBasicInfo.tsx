
import { Input } from "@/components/ui/input";
import { RichTextEditor } from "@/components/forms/RichTextEditor";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { OpportunityType } from "@/types/database/enums";

interface OpportunityBasicInfoProps {
  form: any;
  description: string;
  setDescription: (value: string) => void;
}

export function OpportunityBasicInfo({ form, description, setDescription }: OpportunityBasicInfoProps) {
  const opportunityTypes: { value: OpportunityType; label: string }[] = [
    { value: "job", label: "Job" },
    { value: "internship", label: "Internship" },
    { value: "scholarship", label: "Scholarship" },
    { value: "fellowship", label: "Fellowship" },
    { value: "grant", label: "Grant" },
    { value: "competition", label: "Competition" },
    { value: "event", label: "Event" },
    { value: "volunteer", label: "Volunteer Opportunity" },
    { value: "other", label: "Other" },
  ];

  return (
    <>
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
        name="opportunity_type"
        rules={{ required: "Opportunity type is required" }}
        render={({ field }) => (
          <FormItem>
            <FormLabel>Opportunity Type</FormLabel>
            <Select
              onValueChange={field.onChange}
              value={field.value}
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
        <FormLabel htmlFor="description">Description</FormLabel>
        <RichTextEditor
          value={description}
          onChange={setDescription}
          placeholder="Enter a detailed description of the opportunity"
        />
        {!description.trim() && (
          <p className="text-sm text-destructive">Description is required</p>
        )}
      </div>

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
    </>
  );
}
