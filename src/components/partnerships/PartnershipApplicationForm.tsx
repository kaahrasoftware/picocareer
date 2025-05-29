import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { X, Save } from "lucide-react";
import { EntityTypeStep } from "./form-steps/EntityTypeStep";
import { OrganizationDetailsStep } from "./form-steps/OrganizationDetailsStep";
import { PartnershipGoalsStep } from "./form-steps/PartnershipGoalsStep";
import { PartnershipRequirementsStep } from "./form-steps/PartnershipRequirementsStep";
import { SupportingDocumentsStep } from "./form-steps/SupportingDocumentsStep";
import { ReviewSubmitStep } from "./form-steps/ReviewSubmitStep";
import { SuccessDialog } from "./SuccessDialog";
import { usePartnershipApplication } from "@/hooks/usePartnershipApplication";
import { useToast } from "@/hooks/use-toast";

interface PartnershipApplicationFormProps {
  onCancel: () => void;
}

export function PartnershipApplicationForm({ onCancel }: PartnershipApplicationFormProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);
  const { 
    formData, 
    updateFormData, 
    submitApplication, 
    isSubmitting,
    loadSavedData 
  } = usePartnershipApplication();
  const { toast } = useToast();

  const totalSteps = 6;
  const progress = (currentStep / totalSteps) * 100;

  const stepTitles = [
    "Entity Type & Contact",
    "Organization Details", 
    "Partnership Goals",
    "Partnership Requirements",
    "Supporting Documents",
    "Review & Submit"
  ];

  useEffect(() => {
    loadSavedData();
  }, []);

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

  const handleFinalSubmit = async (finalData: any) => {
    try {
      await submitApplication(finalData);
      setShowSuccessDialog(true);
    } catch (error) {
      // Error handling is done in the hook
    }
  };

  const handleSuccessDialogClose = () => {
    setShowSuccessDialog(false);
    onCancel();
  };

  const saveProgress = () => {
    toast({
      title: "Progress Saved",
      description: "Your application progress has been saved. You can return anytime to continue.",
    });
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
        return <PartnershipRequirementsStep data={formData} onNext={handleStepSubmit} />;
      case 5:
        return <SupportingDocumentsStep data={formData} onNext={handleStepSubmit} />;
      case 6:
        return <ReviewSubmitStep data={formData} onSubmit={handleFinalSubmit} isSubmitting={isSubmitting} />;
      default:
        return null;
    }
  };

  return (
    <>
      <div className="p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-purple-900">Partnership Application</h2>
            <p className="text-gray-600">Step {currentStep} of {totalSteps}: {stepTitles[currentStep - 1]}</p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={saveProgress}>
              <Save className="h-4 w-4 mr-2" />
              Save Progress
            </Button>
            <Button variant="ghost" size="sm" onClick={onCancel}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mb-8">
          <Progress value={progress} className="h-2" />
          <div className="flex justify-between text-xs text-gray-500 mt-2">
            <span>Contact Info</span>
            <span>Organization</span>
            <span>Goals</span>
            <span>Requirements</span>
            <span>Documents</span>
            <span>Submit</span>
          </div>
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

      <SuccessDialog
        isOpen={showSuccessDialog}
        onClose={handleSuccessDialogClose}
      />
    </>
  );
}
