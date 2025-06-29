
import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { CheckCircle, Clock, Calendar, Video } from 'lucide-react';
import { Form } from '@/components/ui/form';
import { eventFormSchema, EventFormData, eventFormSteps } from './types';
import { BasicInfoStep } from './steps/BasicInfoStep';
import { ScheduleStep } from './steps/ScheduleStep';
import { PlatformStep } from './steps/PlatformStep';
import { ReviewStep } from './steps/ReviewStep';
import { useToast } from '@/hooks/use-toast';

interface NewEventUploadFormProps {
  onSubmit: (data: EventFormData) => Promise<void>;
  isSubmitting?: boolean;
}

export function NewEventUploadForm({ onSubmit, isSubmitting = false }: NewEventUploadFormProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);
  const { toast } = useToast();

  const form = useForm<EventFormData>({
    resolver: zodResolver(eventFormSchema),
    defaultValues: {
      title: '',
      description: '',
      start_time: '',
      end_time: '',
      timezone: 'EST',
      max_attendees: 50,
      event_type: 'Webinar',
      platform: 'Google Meet',
      meeting_link: '',
      facilitator: '',
      organized_by: '',
      thumbnail_url: '',
    },
    mode: 'onChange'
  });

  // Auto-save functionality
  useEffect(() => {
    const subscription = form.watch((value) => {
      localStorage.setItem('event-draft', JSON.stringify(value));
    });
    return () => subscription.unsubscribe();
  }, [form]);

  // Load draft on mount
  useEffect(() => {
    const draft = localStorage.getItem('event-draft');
    if (draft) {
      try {
        const draftData = JSON.parse(draft);
        Object.keys(draftData).forEach((key) => {
          if (draftData[key]) {
            form.setValue(key as keyof EventFormData, draftData[key]);
          }
        });
        toast({
          title: "Draft loaded",
          description: "Your previous work has been restored.",
        });
      } catch (error) {
        console.error('Failed to load draft:', error);
      }
    }
  }, [form, toast]);

  const validateCurrentStep = async () => {
    const currentStepConfig = eventFormSteps[currentStep];
    if (currentStepConfig.fields.length === 0) return true;
    
    const isValid = await form.trigger(currentStepConfig.fields);
    return isValid;
  };

  const handleNext = async () => {
    const isValid = await validateCurrentStep();
    if (isValid) {
      if (!completedSteps.includes(currentStep)) {
        setCompletedSteps([...completedSteps, currentStep]);
      }
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    setCurrentStep(currentStep - 1);
  };

  const handleStepClick = async (stepIndex: number) => {
    if (stepIndex < currentStep || completedSteps.includes(stepIndex)) {
      setCurrentStep(stepIndex);
    } else if (stepIndex === currentStep + 1) {
      await handleNext();
    }
  };

  const handleSubmit = async (data: EventFormData) => {
    try {
      await onSubmit(data);
      localStorage.removeItem('event-draft');
      toast({
        title: "Success!",
        description: "Event created successfully.",
      });
    } catch (error) {
      console.error('Form submission error:', error);
    }
  };

  const progress = ((currentStep + 1) / eventFormSteps.length) * 100;

  const renderStepContent = () => {
    switch (currentStep) {
      case 0:
        return <BasicInfoStep form={form} />;
      case 1:
        return <ScheduleStep form={form} />;
      case 2:
        return <PlatformStep form={form} />;
      case 3:
        return <ReviewStep form={form} onEdit={setCurrentStep} />;
      default:
        return null;
    }
  };

  const getStepIcon = (stepIndex: number) => {
    if (completedSteps.includes(stepIndex)) {
      return <CheckCircle className="h-5 w-5 text-green-600" />;
    }
    
    switch (stepIndex) {
      case 0: return <Calendar className="h-5 w-5" />;
      case 1: return <Clock className="h-5 w-5" />;
      case 2: return <Video className="h-5 w-5" />;
      case 3: return <CheckCircle className="h-5 w-5" />;
      default: return null;
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Progress Header */}
      <Card>
        <CardHeader>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <CardTitle>Create New Event</CardTitle>
              <span className="text-sm text-muted-foreground">
                Step {currentStep + 1} of {eventFormSteps.length}
              </span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>
        </CardHeader>
      </Card>

      {/* Step Navigation */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex justify-between">
            {eventFormSteps.map((step, index) => (
              <button
                key={step.id}
                onClick={() => handleStepClick(index)}
                className={`flex flex-col items-center space-y-2 p-4 rounded-lg transition-colors ${
                  index === currentStep
                    ? 'bg-primary text-primary-foreground'
                    : index < currentStep || completedSteps.includes(index)
                    ? 'bg-green-50 text-green-700 hover:bg-green-100'
                    : 'bg-gray-50 text-gray-500 hover:bg-gray-100'
                }`}
                disabled={index > currentStep + 1 && !completedSteps.includes(index)}
              >
                {getStepIcon(index)}
                <div className="text-center">
                  <p className="font-medium text-sm">{step.title}</p>
                  <p className="text-xs opacity-75">{step.description}</p>
                </div>
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Form Provider Wrapper */}
      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)}>
          {/* Step Content */}
          {renderStepContent()}

          {/* Navigation Buttons */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex justify-between">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handlePrevious}
                  disabled={currentStep === 0}
                >
                  Previous
                </Button>

                {currentStep < eventFormSteps.length - 1 ? (
                  <Button type="button" onClick={handleNext}>
                    Next
                  </Button>
                ) : (
                  <Button type="submit" disabled={isSubmitting} className="min-w-32">
                    {isSubmitting ? 'Creating Event...' : 'Create Event'}
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </form>
      </Form>
    </div>
  );
}
