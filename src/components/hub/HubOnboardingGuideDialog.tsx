
import { useState } from "react";
import { 
  Dialog, 
  DialogContent,
  DialogDescription,
  DialogFooter, 
  DialogHeader, 
  DialogTitle 
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ArrowRight, CheckCircle, MessageSquare, FileText, Users, Layers } from "lucide-react";

interface HubOnboardingGuideDialogProps {
  isOpen: boolean;
  onClose: () => void;
  hubName: string;
}

interface GuideStep {
  title: string;
  description: string;
  icon: React.ReactNode;
  tabName: string;
}

export function HubOnboardingGuideDialog({
  isOpen,
  onClose,
  hubName
}: HubOnboardingGuideDialogProps) {
  const [currentStep, setCurrentStep] = useState(0);

  const steps: GuideStep[] = [
    {
      title: "Chat Channels",
      description: "Connect with other members through public and private chat channels. You can participate in existing discussions or create new topic-specific channels.",
      icon: <MessageSquare className="h-12 w-12 text-primary" />,
      tabName: "Channels"
    },
    {
      title: "Announcements",
      description: "Stay updated with important news and updates from administrators. Announcements are categorized and can contain rich content like images and formatted text.",
      icon: <CheckCircle className="h-12 w-12 text-primary" />,
      tabName: "Announcements"
    },
    {
      title: "Resources",
      description: "Access shared documents, links, presentations, and other materials. Resources are organized by categories and can be downloaded or viewed online.",
      icon: <FileText className="h-12 w-12 text-primary" />,
      tabName: "Resources"
    },
    {
      title: "Members",
      description: "View and connect with other members of the hub. You can see their profiles, roles, and contact information if available.",
      icon: <Users className="h-12 w-12 text-primary" />,
      tabName: "Members"
    },
    {
      title: "Communities",
      description: "Explore sub-groups or departments within the hub. Communities allow for specialized discussions and resource sharing for specific interests or teams.",
      icon: <Layers className="h-12 w-12 text-primary" />,
      tabName: "Communities"
    }
  ];

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      onClose();
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSkip = () => {
    onClose();
  };

  const currentStepData = steps[currentStep];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Welcome to {hubName}</DialogTitle>
          <DialogDescription>
            Follow this guide to learn how to use the hub features.
          </DialogDescription>
        </DialogHeader>
        
        <div className="py-6">
          <div className="flex flex-col items-center text-center space-y-4">
            {currentStepData.icon}
            <h3 className="text-lg font-semibold">{currentStepData.title}</h3>
            <p className="text-sm text-muted-foreground">
              {currentStepData.description}
            </p>
            <div className="bg-accent p-4 rounded-lg w-full">
              <p className="text-xs text-muted-foreground mb-2">How to access:</p>
              <div className="flex items-center gap-2 justify-center">
                <span className="px-2 py-1 bg-background border rounded text-xs font-medium">
                  Click the "{currentStepData.tabName}" tab
                </span>
                <ArrowRight className="h-4 w-4 text-muted-foreground" />
                <span className="px-2 py-1 bg-background border rounded text-xs font-medium">
                  Explore the content
                </span>
              </div>
            </div>
            <div className="flex items-center gap-2 mt-2">
              {steps.map((_, index) => (
                <span 
                  key={index}
                  className={`h-2 w-2 rounded-full ${currentStep === index ? 'bg-primary' : 'bg-muted'}`}
                />
              ))}
            </div>
          </div>
        </div>
        
        <DialogFooter className="flex justify-between sm:justify-between">
          <div>
            {currentStep > 0 ? (
              <Button variant="outline" onClick={handlePrevious}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Previous
              </Button>
            ) : (
              <Button variant="outline" onClick={handleSkip}>
                Skip Tour
              </Button>
            )}
          </div>
          <Button onClick={handleNext}>
            {currentStep < steps.length - 1 ? (
              <>
                Next
                <ArrowRight className="h-4 w-4 ml-2" />
              </>
            ) : (
              'Finish'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
