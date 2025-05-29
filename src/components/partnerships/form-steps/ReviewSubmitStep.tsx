
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
        <CardContent className="space-y-6">
          <div>
            <h4 className="font-semibold mb-2">Entity Information</h4>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div><strong>Type:</strong> {data.entity_type}</div>
              <div><strong>Name:</strong> {data.entity_name}</div>
              <div><strong>Contact:</strong> {data.contact_name}</div>
              <div><strong>Email:</strong> {data.contact_email}</div>
              {data.contact_phone && <div><strong>Phone:</strong> {data.contact_phone}</div>}
            </div>
          </div>

          {data.website && (
            <div>
              <h4 className="font-semibold mb-2">Organization Details</h4>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div><strong>Website:</strong> {data.website}</div>
                {data.geographic_location && <div><strong>Location:</strong> {data.geographic_location}</div>}
                {data.student_count && <div><strong>Student Count:</strong> {data.student_count}</div>}
              </div>
              {data.description && (
                <div className="mt-2">
                  <strong>Description:</strong>
                  <p className="text-sm text-gray-600 mt-1">{data.description}</p>
                </div>
              )}
            </div>
          )}

          {data.partnership_goals && (
            <div>
              <h4 className="font-semibold mb-2">Partnership Goals</h4>
              <p className="text-sm text-gray-600">{data.partnership_goals}</p>
              {data.preferred_partnership_type && data.preferred_partnership_type.length > 0 && (
                <div className="mt-2">
                  <strong>Preferred Types:</strong>
                  <p className="text-sm text-gray-600">{data.preferred_partnership_type.join(", ")}</p>
                </div>
              )}
            </div>
          )}

          {(data.budget_range || data.timeline_expectations) && (
            <div>
              <h4 className="font-semibold mb-2">Partnership Requirements</h4>
              <div className="grid grid-cols-2 gap-4 text-sm">
                {data.budget_range && <div><strong>Budget Range:</strong> {data.budget_range}</div>}
                {data.timeline_expectations && <div><strong>Timeline:</strong> {data.timeline_expectations}</div>}
                {data.previous_partnerships && <div><strong>Previous Experience:</strong> {data.previous_partnerships}</div>}
                {data.pilot_program_interest && <div><strong>Pilot Interest:</strong> {data.pilot_program_interest}</div>}
              </div>
              {data.current_technology && (
                <div className="mt-2">
                  <strong>Current Technology:</strong>
                  <p className="text-sm text-gray-600 mt-1">{data.current_technology}</p>
                </div>
              )}
              {data.success_metrics && (
                <div className="mt-2">
                  <strong>Success Metrics:</strong>
                  <p className="text-sm text-gray-600 mt-1">{data.success_metrics}</p>
                </div>
              )}
            </div>
          )}

          {data.additional_info && (
            <div>
              <h4 className="font-semibold mb-2">Additional Information</h4>
              <p className="text-sm text-gray-600">{data.additional_info}</p>
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
        className="w-full bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700"
        size="lg"
      >
        {isSubmitting ? "Submitting Application..." : "Submit Partnership Application"}
      </Button>
    </div>
  );
}
