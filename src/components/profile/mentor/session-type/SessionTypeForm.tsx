import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { SessionTypeSelect } from "./SessionTypeSelect";
import { PlatformSelect } from "./PlatformSelect";
import { PlatformFields } from "./PlatformFields";
import { SessionTypeFormData } from "./types";
import { useToast } from "@/hooks/use-toast";

interface SessionTypeFormProps {
  onSubmit: (data: SessionTypeFormData) => Promise<void>;
  defaultValues?: Partial<SessionTypeFormData>;
}

export function SessionTypeForm({ onSubmit, defaultValues }: SessionTypeFormProps) {
  const { toast } = useToast();
  const form = useForm<SessionTypeFormData>({
    defaultValues: {
      type: defaultValues?.type,
      duration: defaultValues?.duration || 30,
      price: defaultValues?.price || 0,
      description: defaultValues?.description || "",
      meeting_platform: defaultValues?.meeting_platform || ["Google Meet"],
      telegram_username: defaultValues?.telegram_username,
      phone_number: defaultValues?.phone_number,
    },
  });

  const { control, handleSubmit, watch } = form;
  const selectedPlatforms = watch("meeting_platform");

  const showTelegramField = selectedPlatforms.includes("Telegram");
  const showPhoneField = selectedPlatforms.includes("Phone Call");
  const showWhatsAppField = selectedPlatforms.includes("WhatsApp");

  const onFormSubmit = async (data: SessionTypeFormData) => {
    try {
      await onSubmit(data);
    } catch (error) {
      console.error("Error submitting session type:", error);
      toast({
        title: "Error",
        description: "Failed to save session type. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-6">
        <SessionTypeSelect control={control} />
        <PlatformSelect control={control} />
        <PlatformFields
          control={control}
          showTelegramField={showTelegramField}
          showPhoneField={showPhoneField}
          showWhatsAppField={showWhatsAppField}
        />
        
        <div className="bg-white/5 rounded-lg p-4">
          <label htmlFor="duration">Duration (minutes)</label>
          <Input
            id="duration"
            type="number"
            {...form.register("duration", { required: true })}
          />
        </div>

        <div className="bg-white/5 rounded-lg p-4">
          <label htmlFor="price">Price</label>
          <Input
            id="price"
            type="number"
            {...form.register("price", { required: true })}
          />
        </div>

        <div className="bg-white/5 rounded-lg p-4">
          <label htmlFor="description">Description</label>
          <Textarea
            id="description"
            {...form.register("description")}
          />
        </div>

        <Button type="submit" className="w-full">
          Save Session Type
        </Button>
      </form>
    </Form>
  );
}
