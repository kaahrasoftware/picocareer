
import React, { useState } from 'react';
import { useForm, FormProvider } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { StepOne } from './steps/StepOne';
import { StepTwo } from './steps/StepTwo';
import { StepThree } from './steps/StepThree';
import { StepFour } from './steps/StepFour';
import { StepFive } from './steps/StepFive';
import { partnershipApplicationSchema } from './validation/partnershipSchema';
import { usePartnershipSubmission } from './hooks/usePartnershipSubmission';
import type { PartnershipApplicationFormData } from './types';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const steps = [
  { id: 1, title: 'Entity Type & Basic Info', component: StepOne },
  { id: 2, title: 'Organization Details', component: StepTwo },
  { id: 3, title: 'Partnership Goals', component: StepThree },
  { id: 4, title: 'Supporting Documents', component: StepFour },
  { id: 5, title: 'Review & Submit', component: StepFive },
];

export function PartnershipApplicationForm() {
  const [currentStep, setCurrentStep] = useState(1);
  const { submitApplication, isSubmitting } = usePartnershipSubmission();

  const form = useForm<PartnershipApplicationFormData>({
    resolver: zodResolver(partnershipApplicationSchema),
    defaultValues: {
      partner_type: 'university',
      organization_name: '',
      contact_name: '',
      contact_email: '',
      partnership_goals: '',
      terms_accepted: false,
      supporting_documents: [],
      focus_areas: [],
      collaboration_areas: [],
    },
    mode: 'onChange'
  });

  const { watch, trigger } = form;
  const watchedValues = watch();

  const nextStep = async () => {
    const fieldsToValidate = getFieldsForStep(currentStep);
    const isValid = await trigger(fieldsToValidate);
    
    if (isValid && currentStep < steps.length) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const getFieldsForStep = (step: number): (keyof PartnershipApplicationFormData)[] => {
    switch (step) {
      case 1:
        return ['partner_type', 'organization_name', 'contact_name', 'contact_email'];
      case 2:
        return ['organization_size', 'website', 'established_year'];
      case 3:
        return ['partnership_goals'];
      case 4:
        return [];
      case 5:
        return ['terms_accepted'];
      default:
        return [];
    }
  };

  const onSubmit = async (data: PartnershipApplicationFormData) => {
    try {
      await submitApplication(data);
    } catch (error) {
      console.error('Submission error:', error);
    }
  };

  const progress = (currentStep / steps.length) * 100;
  const CurrentStepComponent = steps[currentStep - 1].component;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center mb-4">
            <CardTitle className="text-lg">
              Step {currentStep} of {steps.length}: {steps[currentStep - 1].title}
            </CardTitle>
            <span className="text-sm text-gray-500">{Math.round(progress)}% Complete</span>
          </div>
          <Progress value={progress} className="w-full" />
        </CardHeader>
        
        <CardContent>
          <FormProvider {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <CurrentStepComponent form={form} data={watchedValues} />
              
              <div className="flex justify-between pt-6 border-t">
                <Button
                  type="button"
                  variant="outline"
                  onClick={prevStep}
                  disabled={currentStep === 1}
                  className="flex items-center"
                >
                  <ChevronLeft className="h-4 w-4 mr-1" />
                  Previous
                </Button>
                
                {currentStep < steps.length ? (
                  <Button
                    type="button"
                    onClick={nextStep}
                    className="flex items-center"
                  >
                    Next
                    <ChevronRight className="h-4 w-4 ml-1" />
                  </Button>
                ) : (
                  <Button
                    type="submit"
                    disabled={isSubmitting || !watchedValues.terms_accepted}
                    className="flex items-center"
                  >
                    {isSubmitting ? 'Submitting...' : 'Submit Application'}
                  </Button>
                )}
              </div>
            </form>
          </FormProvider>
        </CardContent>
      </Card>
    </div>
  );
}
