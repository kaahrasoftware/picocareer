
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PartnershipFormData } from "@/hooks/usePartnershipApplication";

const partnershipRequirementsSchema = z.object({
  budget_range: z.string().min(1, "Please select a budget range"),
  timeline_expectations: z.string().min(1, "Please select timeline expectations"),
  current_technology: z.string().min(20, "Please provide at least 20 characters about your current technology"),
  success_metrics: z.string().min(30, "Please provide at least 30 characters about success metrics"),
  previous_partnerships: z.string().min(1, "Please select previous partnership experience"),
  pilot_program_interest: z.string().min(1, "Please select pilot program interest level"),
});

type PartnershipRequirementsData = z.infer<typeof partnershipRequirementsSchema>;

interface PartnershipRequirementsStepProps {
  data: PartnershipFormData;
  onNext: (data: PartnershipRequirementsData) => void;
}

export function PartnershipRequirementsStep({ data, onNext }: PartnershipRequirementsStepProps) {
  const form = useForm<PartnershipRequirementsData>({
    resolver: zodResolver(partnershipRequirementsSchema),
    defaultValues: {
      budget_range: data.budget_range || "",
      timeline_expectations: data.timeline_expectations || "",
      current_technology: data.current_technology || "",
      success_metrics: data.success_metrics || "",
      previous_partnerships: data.previous_partnerships || "",
      pilot_program_interest: data.pilot_program_interest || "",
    },
  });

  const onSubmit = (formData: PartnershipRequirementsData) => {
    console.log('Partnership Requirements Step - Form submission:', {
      step: 'PartnershipRequirementsStep',
      formData,
      fieldNames: Object.keys(formData)
    });
    
    onNext(formData);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div>
          <h3 className="text-xl font-semibold text-purple-900 mb-4">
            Partnership Requirements & Expectations
          </h3>
          <p className="text-gray-600 mb-6">
            Help us understand your requirements and expectations for this partnership.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <Card className="p-4">
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Budget & Investment</CardTitle>
            </CardHeader>
            <CardContent>
              <FormField
                control={form.control}
                name="budget_range"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Expected Budget Range</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select budget range" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="under-10k">Under $10,000</SelectItem>
                        <SelectItem value="10k-50k">$10,000 - $50,000</SelectItem>
                        <SelectItem value="50k-100k">$50,000 - $100,000</SelectItem>
                        <SelectItem value="100k-500k">$100,000 - $500,000</SelectItem>
                        <SelectItem value="500k-plus">$500,000+</SelectItem>
                        <SelectItem value="grant-funded">Grant Funded</SelectItem>
                        <SelectItem value="to-be-determined">To be determined</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          <Card className="p-4">
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Timeline</CardTitle>
            </CardHeader>
            <CardContent>
              <FormField
                control={form.control}
                name="timeline_expectations"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Implementation Timeline</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select timeline" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="immediate">Immediate (1-3 months)</SelectItem>
                        <SelectItem value="short-term">Short-term (3-6 months)</SelectItem>
                        <SelectItem value="medium-term">Medium-term (6-12 months)</SelectItem>
                        <SelectItem value="long-term">Long-term (12+ months)</SelectItem>
                        <SelectItem value="flexible">Flexible timeline</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>
        </div>

        <FormField
          control={form.control}
          name="current_technology"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Current Technology Infrastructure</FormLabel>
              <FormControl>
                <Textarea 
                  placeholder="Describe your current technology setup, learning management systems, student information systems, and any existing career services platforms or tools you're currently using."
                  className="min-h-[100px]"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="success_metrics"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Success Metrics & KPIs</FormLabel>
              <FormControl>
                <Textarea 
                  placeholder="What metrics would you use to measure the success of this partnership? (e.g., student engagement rates, career placement rates, user adoption, etc.)"
                  className="min-h-[100px]"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="previous_partnerships"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Previous Partnership Experience</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select experience level" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="first-time">First-time partnership</SelectItem>
                    <SelectItem value="some-experience">Some experience with partnerships</SelectItem>
                    <SelectItem value="extensive-experience">Extensive partnership experience</SelectItem>
                    <SelectItem value="ongoing-partnerships">Multiple ongoing partnerships</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="pilot_program_interest"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Pilot Program Interest</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select interest level" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="very-interested">Very interested in pilot</SelectItem>
                    <SelectItem value="somewhat-interested">Somewhat interested</SelectItem>
                    <SelectItem value="prefer-full">Prefer full implementation</SelectItem>
                    <SelectItem value="needs-discussion">Needs further discussion</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="flex justify-end">
          <Button type="submit" className="bg-purple-600 hover:bg-purple-700">
            Continue to Supporting Documents
          </Button>
        </div>
      </form>
    </Form>
  );
}
