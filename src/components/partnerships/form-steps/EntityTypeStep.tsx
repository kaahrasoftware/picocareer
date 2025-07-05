
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PartnershipFormData } from "@/hooks/usePartnershipApplication";

const entityTypeSchema = z.object({
  entity_type: z.string().min(1, "Entity type is required"),
  entity_name: z.string().min(1, "Entity name is required"),
  contact_name: z.string().min(1, "Contact name is required"),
  contact_email: z.string().email("Please enter a valid email address"),
  contact_phone: z.string().optional(),
});

type EntityTypeData = z.infer<typeof entityTypeSchema>;

interface EntityTypeStepProps {
  data: PartnershipFormData;
  onNext: (data: EntityTypeData) => void;
}

export function EntityTypeStep({ data, onNext }: EntityTypeStepProps) {
  const form = useForm<EntityTypeData>({
    resolver: zodResolver(entityTypeSchema),
    defaultValues: {
      entity_type: data.entity_type || "",
      entity_name: data.entity_name || "",
      contact_name: data.contact_name || "",
      contact_email: data.contact_email || "",
      contact_phone: data.contact_phone || "",
    },
  });

  const onSubmit = (formData: EntityTypeData) => {
    onNext(formData);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div>
          <h3 className="text-xl font-semibold text-purple-900 mb-4">
            Entity Type & Contact Information
          </h3>
          <p className="text-gray-600 mb-6">
            Tell us about your organization and who we should contact regarding this partnership.
          </p>
        </div>

        <FormField
          control={form.control}
          name="entity_type"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Entity Type</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select your entity type" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="university">University/College</SelectItem>
                  <SelectItem value="high_school">High School</SelectItem>
                  <SelectItem value="community_college">Community College</SelectItem>
                  <SelectItem value="bootcamp">Coding Bootcamp</SelectItem>
                  <SelectItem value="nonprofit">Non-Profit Organization</SelectItem>
                  <SelectItem value="government">Government Agency</SelectItem>
                  <SelectItem value="corporation">Corporation</SelectItem>
                  <SelectItem value="startup">Startup</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="entity_name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Organization Name</FormLabel>
              <FormControl>
                <Input placeholder="Enter your organization name" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="contact_name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Contact Person Name</FormLabel>
                <FormControl>
                  <Input placeholder="Full name" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="contact_email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Contact Email</FormLabel>
                <FormControl>
                  <Input placeholder="email@organization.com" type="email" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="contact_phone"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Contact Phone (Optional)</FormLabel>
              <FormControl>
                <Input placeholder="+1 (555) 123-4567" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end">
          <Button type="submit" className="bg-purple-600 hover:bg-purple-700">
            Continue to Organization Details
          </Button>
        </div>
      </form>
    </Form>
  );
}
