
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { useState } from "react";
import { PartnershipFormData } from "@/hooks/usePartnershipApplication";

interface ReviewSubmitStepProps {
  data: PartnershipFormData;
  onSubmit: (finalData: PartnershipFormData) => Promise<void>;
  isSubmitting: boolean;
}

export function ReviewSubmitStep({ data, onSubmit, isSubmitting }: ReviewSubmitStepProps) {
  const [acceptedTerms, setAcceptedTerms] = useState(false);

  const handleSubmit = async () => {
    if (!acceptedTerms) return;
    await onSubmit(data);
  };

  const handleTermsChange = (checked: boolean | "indeterminate") => {
    if (typeof checked === "boolean") {
      setAcceptedTerms(checked);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Review Your Application</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h4 className="font-semibold">Entity Information</h4>
            <p><strong>Type:</strong> {data.entity_type}</p>
            <p><strong>Name:</strong> {data.entity_name}</p>
            <p><strong>Contact:</strong> {data.contact_name}</p>
            <p><strong>Email:</strong> {data.contact_email}</p>
            {data.contact_phone && <p><strong>Phone:</strong> {data.contact_phone}</p>}
          </div>

          {data.website && (
            <div>
              <h4 className="font-semibold">Organization Details</h4>
              <p><strong>Website:</strong> {data.website}</p>
              {data.geographic_location && <p><strong>Location:</strong> {data.geographic_location}</p>}
              {data.student_count && <p><strong>Student Count:</strong> {data.student_count}</p>}
              {data.description && <p><strong>Description:</strong> {data.description}</p>}
            </div>
          )}

          {data.partnership_goals && (
            <div>
              <h4 className="font-semibold">Partnership Goals</h4>
              <p>{data.partnership_goals}</p>
              {data.preferred_partnership_type && data.preferred_partnership_type.length > 0 && (
                <p><strong>Preferred Types:</strong> {data.preferred_partnership_type.join(", ")}</p>
              )}
            </div>
          )}

          {data.additional_info && (
            <div>
              <h4 className="font-semibold">Additional Information</h4>
              <p>{data.additional_info}</p>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="flex items-center space-x-2">
        <Checkbox
          id="terms"
          checked={acceptedTerms}
          onCheckedChange={handleTermsChange}
        />
        <label
          htmlFor="terms"
          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
        >
          I agree to the terms and conditions and authorize PicoCareer to contact me regarding this partnership application.
        </label>
      </div>

      <Button
        onClick={handleSubmit}
        disabled={!acceptedTerms || isSubmitting}
        className="w-full"
        size="lg"
      >
        {isSubmitting ? "Submitting..." : "Submit Application"}
      </Button>
    </div>
  );
}
