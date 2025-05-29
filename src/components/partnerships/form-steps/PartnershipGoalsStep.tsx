
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { PartnershipFormData } from "@/hooks/usePartnershipApplication";

const partnershipGoalsSchema = z.object({
  partnership_goals: z.string().min(50, "Please provide at least 50 characters describing your partnership goals"),
  preferred_partnership_type: z.array(z.string()).min(1, "Please select at least one partnership type"),
});

type PartnershipGoalsData = z.infer<typeof partnershipGoalsSchema>;

interface PartnershipGoalsStepProps {
  data: PartnershipFormData;
  onNext: (data: PartnershipGoalsData) => void;
}

export function PartnershipGoalsStep({ data, onNext }: PartnershipGoalsStepProps) {
  const form = useForm<PartnershipGoalsData>({
    resolver: zodResolver(partnershipGoalsSchema),
    defaultValues: {
      partnership_goals: data.partnership_goals || "",
      preferred_partnership_type: data.preferred_partnership_type || [],
    },
  });

  const partnershipTypes = [
    { id: "content_licensing", label: "Content Licensing & Integration" },
    { id: "white_label", label: "White-label Platform Solutions" },
    { id: "curriculum_development", label: "Curriculum Development Partnership" },
    { id: "mentorship_program", label: "Mentorship Program Integration" },
    { id: "student_analytics", label: "Student Analytics & Insights" },
    { id: "professional_development", label: "Professional Development for Educators" },
    { id: "research_collaboration", label: "Research & Data Collaboration" },
    { id: "grant_partnerships", label: "Grant & Funding Partnerships" },
    { id: "custom_solutions", label: "Custom Integration Solutions" },
  ];

  const onSubmit = (formData: PartnershipGoalsData) => {
    onNext(formData);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div>
          <h3 className="text-xl font-semibold text-purple-900 mb-4">
            Partnership Goals & Expectations
          </h3>
          <p className="text-gray-600 mb-6">
            Share your objectives and the type of collaboration you're most interested in.
          </p>
        </div>

        <FormField
          control={form.control}
          name="partnership_goals"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Partnership Goals & Objectives</FormLabel>
              <FormControl>
                <Textarea 
                  placeholder="Describe what you hope to achieve through this partnership. Include specific goals, expected outcomes, timeline considerations, and how you envision the collaboration benefiting your students or organization."
                  className="min-h-[120px]"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="preferred_partnership_type"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-base font-medium">
                Preferred Partnership Types (Select all that interest you)
              </FormLabel>
              <FormControl>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                  {partnershipTypes.map((type) => (
                    <div key={type.id} className="flex items-center space-x-2">
                      <Checkbox
                        id={type.id}
                        checked={field.value?.includes(type.id)}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            field.onChange([...field.value, type.id]);
                          } else {
                            field.onChange(field.value?.filter((value) => value !== type.id));
                          }
                        }}
                      />
                      <label
                        htmlFor={type.id}
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                      >
                        {type.label}
                      </label>
                    </div>
                  ))}
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end">
          <Button type="submit" className="bg-purple-600 hover:bg-purple-700">
            Continue to Supporting Documents
          </Button>
        </div>
      </form>
    </Form>
  );
}
