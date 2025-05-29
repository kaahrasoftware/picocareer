
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { PartnershipFormData } from "@/hooks/usePartnershipApplication";

const organizationDetailsSchema = z.object({
  website: z.string().url("Please enter a valid website URL").optional().or(z.literal("")),
  geographic_location: z.string().min(1, "Geographic location is required"),
  student_count: z.number().min(0).optional(),
  description: z.string().min(50, "Please provide at least 50 characters describing your organization"),
});

type OrganizationDetailsData = z.infer<typeof organizationDetailsSchema>;

interface OrganizationDetailsStepProps {
  data: PartnershipFormData;
  onNext: (data: OrganizationDetailsData) => void;
}

export function OrganizationDetailsStep({ data, onNext }: OrganizationDetailsStepProps) {
  const form = useForm<OrganizationDetailsData>({
    resolver: zodResolver(organizationDetailsSchema),
    defaultValues: {
      website: data.website || "",
      geographic_location: data.geographic_location || "",
      student_count: data.student_count || undefined,
      description: data.description || "",
    },
  });

  const onSubmit = (formData: OrganizationDetailsData) => {
    onNext(formData);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div>
          <h3 className="text-xl font-semibold text-purple-900 mb-4">
            Organization Details
          </h3>
          <p className="text-gray-600 mb-6">
            Help us understand your organization better so we can tailor our partnership approach.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="website"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Website (Optional)</FormLabel>
                <FormControl>
                  <Input placeholder="https://www.yourorganization.com" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="geographic_location"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Geographic Location</FormLabel>
                <FormControl>
                  <Input placeholder="City, State/Province, Country" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="student_count"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Number of Students/Members (Optional)</FormLabel>
              <FormControl>
                <Input 
                  type="number" 
                  placeholder="Enter approximate number"
                  value={field.value || ""}
                  onChange={(e) => field.onChange(e.target.value ? parseInt(e.target.value) : undefined)}
                />
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
              <FormLabel>Organization Description</FormLabel>
              <FormControl>
                <Textarea 
                  placeholder="Tell us about your organization, its mission, current programs, and target audience. Include any relevant background that would help us understand how we can best work together."
                  className="min-h-[120px]"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end">
          <Button type="submit" className="bg-purple-600 hover:bg-purple-700">
            Continue to Partnership Goals
          </Button>
        </div>
      </form>
    </Form>
  );
}
