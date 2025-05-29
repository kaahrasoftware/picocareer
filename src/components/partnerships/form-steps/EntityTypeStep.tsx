import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { PartnershipFormData } from "@/hooks/usePartnershipApplication";
const entityTypeSchema = z.object({
  entity_type: z.string().min(1, "Please select an entity type"),
  entity_name: z.string().min(1, "Organization name is required"),
  contact_name: z.string().min(1, "Contact name is required"),
  contact_email: z.string().email("Please enter a valid email address"),
  contact_phone: z.string().optional()
});
type EntityTypeData = z.infer<typeof entityTypeSchema>;
interface EntityTypeStepProps {
  data: PartnershipFormData;
  onNext: (data: EntityTypeData) => void;
}
export function EntityTypeStep({
  data,
  onNext
}: EntityTypeStepProps) {
  const form = useForm<EntityTypeData>({
    resolver: zodResolver(entityTypeSchema),
    defaultValues: {
      entity_type: data.entity_type || "",
      entity_name: data.entity_name || "",
      contact_name: data.contact_name || "",
      contact_email: data.contact_email || "",
      contact_phone: data.contact_phone || ""
    }
  });
  const entityTypes = [{
    value: "university",
    label: "University/College",
    icon: "🎓"
  }, {
    value: "high_school",
    label: "High School",
    icon: "🏫"
  }, {
    value: "trade_school",
    label: "Trade School",
    icon: "🔧"
  }, {
    value: "organization",
    label: "Organization/Nonprofit",
    icon: "🏢"
  }, {
    value: "individual",
    label: "Individual Educator",
    icon: "👨‍🏫"
  }, {
    value: "industry",
    label: "Industry Partner",
    icon: "⚡"
  }];
  const onSubmit = (formData: EntityTypeData) => {
    onNext(formData);
  };
  return <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div>
          <h3 className="text-xl font-semibold text-purple-900 mb-4">
            Entity Type & Basic Information
          </h3>
          <p className="text-gray-600 mb-6">
            Tell us about your organization and how we can best support your partnership goals.
          </p>
        </div>

        <FormField control={form.control} name="entity_type" render={({
        field
      }) => <FormItem>
              <FormLabel className="text-base font-medium">What type of organization are you?</FormLabel>
              <FormControl>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {entityTypes.map(type => <Card key={type.value} className={`cursor-pointer transition-all hover:shadow-md ${field.value === type.value ? "ring-2 ring-purple-500 bg-purple-50" : "hover:bg-gray-50"}`} onClick={() => field.onChange(type.value)}>
                      <CardContent className="p-4 text-center">
                        <div className="text-2xl mb-2">{type.icon}</div>
                        <div className="font-medium">{type.label}</div>
                      </CardContent>
                    </Card>)}
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>} />

        <div className="grid md:grid-cols-2 gap-4">
          <FormField control={form.control} name="entity_name" render={({
          field
        }) => <FormItem>
                <FormLabel>Organization Name</FormLabel>
                <FormControl>
                  <Input placeholder="Enter your organization name" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>} />

          <FormField control={form.control} name="contact_name" render={({
          field
        }) => <FormItem>
                <FormLabel>Primary Contact Name</FormLabel>
                <FormControl>
                  <Input placeholder="Your full name" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>} />
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <FormField control={form.control} name="contact_email" render={({
          field
        }) => <FormItem>
                <FormLabel>Contact Email</FormLabel>
                <FormControl>
                  <Input type="email" placeholder="your.email@organization.com" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>} />

          <FormField control={form.control} name="contact_phone" render={({
          field
        }) => <FormItem>
                <FormLabel>Phone Number (Optional)</FormLabel>
                <FormControl>
                  <Input placeholder="+1 (555) 123-4567" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>} />
        </div>

        <div className="flex justify-end">
          <Button type="submit" className="bg-sky-600 hover:bg-sky-500">
            Continue to Organization Details
          </Button>
        </div>
      </form>
    </Form>;
}