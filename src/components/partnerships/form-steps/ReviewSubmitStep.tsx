
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Loader2 } from "lucide-react";
import { PartnershipFormData } from "@/hooks/usePartnershipApplication";

interface ReviewSubmitStepProps {
  data: PartnershipFormData;
  onSubmit: (data: PartnershipFormData) => Promise<any>;
  isSubmitting: boolean;
}

export function ReviewSubmitStep({ data, onSubmit, isSubmitting }: ReviewSubmitStepProps) {
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async () => {
    if (!acceptedTerms) return;
    
    try {
      await onSubmit(data);
      setSubmitted(true);
    } catch (error) {
      // Error handling is done in the hook
    }
  };

  const getEntityTypeLabel = (type: string) => {
    const types: Record<string, string> = {
      university: "University/College",
      high_school: "High School", 
      trade_school: "Trade School",
      organization: "Organization/Nonprofit",
      individual: "Individual Educator",
      industry: "Industry Partner"
    };
    return types[type] || type;
  };

  if (submitted) {
    return (
      <div className="text-center py-12">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <span className="text-2xl">✅</span>
        </div>
        <h3 className="text-2xl font-bold text-green-700 mb-4">Application Submitted Successfully!</h3>
        <p className="text-gray-600 max-w-2xl mx-auto">
          Thank you for your interest in partnering with PicoCareer. We've received your application 
          and will review it carefully. Our partnership team will reach out to you within 3-5 business 
          days to discuss next steps.
        </p>
        <div className="mt-8 p-4 bg-blue-50 rounded-lg">
          <p className="text-sm text-blue-700">
            <strong>What's next?</strong> Check your email for a confirmation message with your 
            application reference number and additional information about our partnership process.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-xl font-semibold text-purple-900 mb-4">
          Review & Submit Application
        </h3>
        <p className="text-gray-600 mb-6">
          Please review your information before submitting your partnership application.
        </p>
      </div>

      <div className="grid gap-6">
        {/* Entity Type & Contact */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Entity Type & Contact Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div><strong>Organization Type:</strong> {getEntityTypeLabel(data.entity_type || '')}</div>
            <div><strong>Organization Name:</strong> {data.entity_name}</div>
            <div><strong>Contact Name:</strong> {data.contact_name}</div>
            <div><strong>Email:</strong> {data.contact_email}</div>
            {data.contact_phone && <div><strong>Phone:</strong> {data.contact_phone}</div>}
          </CardContent>
        </Card>

        {/* Organization Details */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Organization Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {data.website && <div><strong>Website:</strong> {data.website}</div>}
            <div><strong>Location:</strong> {data.geographic_location}</div>
            {data.student_count && <div><strong>Students/Members:</strong> {data.student_count}</div>}
            <div><strong>Description:</strong> {data.description}</div>
          </CardContent>
        </Card>

        {/* Partnership Goals */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Partnership Goals</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div><strong>Goals:</strong> {data.partnership_goals}</div>
            {data.preferred_partnership_type && data.preferred_partnership_type.length > 0 && (
              <div>
                <strong>Preferred Partnership Types:</strong>
                <ul className="list-disc list-inside mt-1">
                  {data.preferred_partnership_type.map((type, index) => (
                    <li key={index} className="text-sm">{type.replace(/_/g, ' ')}</li>
                  ))}
                </ul>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Additional Information */}
        {data.additional_info && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Additional Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div>{data.additional_info}</div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Terms and Conditions */}
      <Card className="border-purple-200">
        <CardContent className="p-6">
          <div className="flex items-start space-x-3">
            <Checkbox
              id="terms"
              checked={acceptedTerms}
              onCheckedChange={setAcceptedTerms}
            />
            <div className="text-sm">
              <label htmlFor="terms" className="cursor-pointer">
                I acknowledge that this application is not a binding agreement and understand that 
                PicoCareer will review this information to determine partnership compatibility. 
                I agree to participate in good faith discussions about potential collaboration 
                opportunities.
              </label>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Submit Button */}
      <div className="flex justify-center">
        <Button
          onClick={handleSubmit}
          disabled={!acceptedTerms || isSubmitting}
          className="bg-purple-600 hover:bg-purple-700 px-8 py-3"
          size="lg"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Submitting Application...
            </>
          ) : (
            "Submit Partnership Application"
          )}
        </Button>
      </div>
    </div>
  );
}
