
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { X } from "lucide-react";
import { EntityTypeStep } from "./form-steps/EntityTypeStep";
import { OrganizationDetailsStep } from "./form-steps/OrganizationDetailsStep";
import { PartnershipGoalsStep } from "./form-steps/PartnershipGoalsStep";
import { SupportingDocumentsStep } from "./form-steps/SupportingDocumentsStep";
import { ReviewSubmitStep } from "./form-steps/ReviewSubmitStep";
import { usePartnershipApplication } from "@/hooks/usePartnershipApplication";

interface PartnershipApplicationFormProps {
  onCancel: () => void;
}

export function PartnershipApplicationForm({ onCancel }: PartnershipApplicationFormProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const { formData, updateFormData, submitApplication, isSubmitting } = usePartnershipApplication();

  const totalSteps = 5;
  const progress = (currentStep / totalSteps) * 100;

  const stepTitles = [
    "Entity Type & Contact",
    "Organization Details", 
    "Partnership Goals",
    "Supporting Documents",
    "Review & Submit"
  ];

  const handleNext = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleStepSubmit = (stepData: any) => {
    updateFormData(stepData);
    handleNext();
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return <EntityTypeStep data={formData} onNext={handleStepSubmit} />;
      case 2:
        return <OrganizationDetailsStep data={formData} onNext={handleStepSubmit} />;
      case 3:
        return <PartnershipGoalsStep data={formData} onNext={handleStepSubmit} />;
      case 4:
        return <SupportingDocumentsStep data={formData} onNext={handleStepSubmit} />;
      case 5:
        return <ReviewSubmitStep data={formData} onSubmit={submitApplication} isSubmitting={isSubmitting} />;
      default:
        return null;
    }
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-purple-900">Partnership Application</h2>
          <p className="text-gray-600">Step {currentStep} of {totalSteps}: {stepTitles[currentStep - 1]}</p>
        </div>
        <Button variant="ghost" size="sm" onClick={onCancel}>
          <X className="h-4 w-4" />
        </Button>
      </div>

      {/* Progress Bar */}
      <div className="mb-8">
        <Progress value={progress} className="h-2" />
      </div>

      {/* Step Content */}
      <div className="mb-8">
        {renderStep()}
      </div>

      {/* Navigation */}
      {currentStep > 1 && currentStep < totalSteps && (
        <div className="flex justify-between">
          <Button variant="outline" onClick={handlePrevious}>
            Previous
          </Button>
          <div /> {/* Spacer - Next button is handled by individual steps */}
        </div>
      )}
    </div>
  );
}
