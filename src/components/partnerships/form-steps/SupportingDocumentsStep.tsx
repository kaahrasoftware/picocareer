
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { PartnershipFormData } from "@/hooks/usePartnershipApplication";

const supportingDocumentsSchema = z.object({
  additional_info: z.string().optional(),
});

type SupportingDocumentsData = z.infer<typeof supportingDocumentsSchema>;

interface SupportingDocumentsStepProps {
  data: PartnershipFormData;
  onNext: (data: SupportingDocumentsData) => void;
}

export function SupportingDocumentsStep({ data, onNext }: SupportingDocumentsStepProps) {
  const form = useForm<SupportingDocumentsData>({
    resolver: zodResolver(supportingDocumentsSchema),
    defaultValues: {
      additional_info: data.additional_info || "",
    },
  });

  const onSubmit = (formData: SupportingDocumentsData) => {
    onNext(formData);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div>
          <h3 className="text-xl font-semibold text-purple-900 mb-4">
            Supporting Documents & Additional Information
          </h3>
          <p className="text-gray-600 mb-6">
            Share any additional information or documents that would help us understand your needs better.
          </p>
        </div>

        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="p-4">
            <h4 className="font-medium text-blue-900 mb-2">Document Upload Coming Soon</h4>
            <p className="text-sm text-blue-700">
              File upload functionality is currently being developed. For now, you can mention any 
              documents you'd like to share in the additional information section below, and we'll 
              follow up with you about sharing them during our initial call.
            </p>
          </CardContent>
        </Card>

        <div className="space-y-4">
          <h4 className="font-medium text-gray-900">Helpful Documents to Prepare (Optional)</h4>
          <ul className="text-sm text-gray-600 space-y-2">
            <li>• Organization brochure or fact sheet</li>
            <li>• Current curriculum or program descriptions</li>
            <li>• Student demographics and success metrics</li>
            <li>• Letters of support or endorsement</li>
            <li>• Accreditation documentation</li>
            <li>• Previous partnership agreements (as reference)</li>
          </ul>
        </div>

        <FormField
          control={form.control}
          name="additional_info"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Additional Information</FormLabel>
              <FormControl>
                <Textarea 
                  placeholder="Share any additional context, specific requirements, timeline constraints, or questions you have about the partnership process. You can also mention any documents you'd like to share during our follow-up discussion."
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
            Continue to Review & Submit
          </Button>
        </div>
      </form>
    </Form>
  );
}
