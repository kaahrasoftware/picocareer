import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { SessionTypeSelect } from "./SessionTypeSelect";
import { PlatformSelect } from "./PlatformSelect";
import { PlatformFields } from "./PlatformFields";
import { useToast } from "@/hooks/use-toast";
import type { SessionTypeFormData, SessionTypeFormProps } from "./types";

export function SessionTypeForm({ onSubmit, onSuccess, onCancel, profileId, existingTypes = [] }: SessionTypeFormProps) {
  const { toast } = useToast();
  const form = useForm<SessionTypeFormData>({
    defaultValues: {
      type: undefined,
      duration: 30,
      price: 0,
      description: "",
      meeting_platform: ["Google Meet"],
      telegram_username: "",
      phone_number: "",
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
      onSuccess();
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

        <div className="flex justify-end gap-4">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="submit">
            Save Session Type
          </Button>
        </div>
      </form>
    </Form>
  );
}