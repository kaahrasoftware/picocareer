import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { SessionTypeEnum, SESSION_TYPE_OPTIONS } from "@/types/session";
import type { MeetingPlatform } from "@/types/calendar";
import { useState } from "react";
import { useToast } from "@/components/ui/use-toast";
import { BasicInfoSection } from "./form-sections/BasicInfoSection";
import { PlatformSection } from "./form-sections/PlatformSection";
import { ContactInfoSection } from "./form-sections/ContactInfoSection";

interface SessionTypeFormProps {
  onSubmit: (data: {
    type: SessionTypeEnum;
    duration: string;
    price: string;
    description: string;
    meeting_platform: MeetingPlatform[];
    telegram_username?: string;
    phone_number?: string;
  }) => void;
  onCancel: () => void;
  existingTypes: SessionTypeEnum[];
}

interface FormValues {
  type: SessionTypeEnum;
  duration: string;
  description: string;
  telegram_username?: string;
  phone_number?: string;
}

export function SessionTypeForm({ onSubmit, onCancel, existingTypes }: SessionTypeFormProps) {
  const { toast } = useToast();
  const form = useForm<FormValues>({
    defaultValues: {
      type: SESSION_TYPE_OPTIONS[0],
      duration: '30',
      description: '',
      telegram_username: '',
      phone_number: '',
    },
  });

  const [selectedPlatforms, setSelectedPlatforms] = useState<MeetingPlatform[]>(["Google Meet"]);

  const availableTypes = SESSION_TYPE_OPTIONS.filter(type => !existingTypes.includes(type));

  const handleSubmit = (data: FormValues) => {
    if (selectedPlatforms.length === 0) {
      toast({
        title: "Error",
        description: "Please select at least one meeting platform",
        variant: "destructive",
      });
      return;
    }

    if (selectedPlatforms.includes("Telegram") && !data.telegram_username) {
      toast({
        title: "Error",
        description: "Telegram username is required when Telegram is selected",
        variant: "destructive",
      });
      return;
    }

    if ((selectedPlatforms.includes("WhatsApp") || selectedPlatforms.includes("Phone Call")) && !data.phone_number) {
      toast({
        title: "Error",
        description: "Phone number is required for WhatsApp or Phone Call",
        variant: "destructive",
      });
      return;
    }

    const submissionData = {
      ...data,
      price: "0.00", // Set default price to 0.00
      meeting_platform: selectedPlatforms,
      telegram_username: selectedPlatforms.includes("Telegram") ? data.telegram_username : undefined,
      phone_number: (selectedPlatforms.includes("WhatsApp") || selectedPlatforms.includes("Phone Call")) 
        ? data.phone_number 
        : undefined,
    };

    onSubmit(submissionData);
  };

  const togglePlatform = (platform: MeetingPlatform) => {
    setSelectedPlatforms(current =>
      current.includes(platform)
        ? current.filter(p => p !== platform)
        : [...current, platform]
    );
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="max-h-[70vh] overflow-y-auto pr-4 space-y-4">
        <BasicInfoSection form={form} availableTypes={availableTypes} />
        <PlatformSection 
          selectedPlatforms={selectedPlatforms}
          onPlatformToggle={togglePlatform}
        />
        <ContactInfoSection 
          form={form}
          selectedPlatforms={selectedPlatforms}
        />

        <div className="flex gap-2 justify-end">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="submit">
            Add Session Type
          </Button>
        </div>
      </form>
    </Form>
  );
}