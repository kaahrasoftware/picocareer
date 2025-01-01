import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Form, FormField, FormItem, FormLabel } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { SessionTypeEnum, SESSION_TYPE_OPTIONS } from "@/types/session";
import type { MeetingPlatform } from "@/types/calendar";
import { Checkbox } from "@/components/ui/checkbox";
import { useState } from "react"; // Added missing import

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

  // Filter out already used session types
  const availableTypes = SESSION_TYPE_OPTIONS.filter(type => !existingTypes.includes(type));

  const handleSubmit = (data: FormValues) => {
    onSubmit({
      ...data,
      price: '0', // Set default price to 0
      meeting_platform: selectedPlatforms,
    });
  };

  const togglePlatform = (platform: MeetingPlatform) => {
    setSelectedPlatforms(current =>
      current.includes(platform)
        ? current.filter(p => p !== platform)
        : [...current, platform]
    );

    // Reset related fields when platform is unselected
    if (platform === "Telegram" && !selectedPlatforms.includes("Telegram")) {
      form.setValue('telegram_username', '');
    }
    if ((platform === "WhatsApp" || platform === "Phone Call") && 
        !selectedPlatforms.includes("WhatsApp") && 
        !selectedPlatforms.includes("Phone Call")) {
      form.setValue('phone_number', '');
    }
  };

  const needsPhoneNumber = selectedPlatforms.includes("WhatsApp") || selectedPlatforms.includes("Phone Call");

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="type"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Session Type</FormLabel>
              <select
                {...field}
                className="w-full p-2 border rounded-md"
              >
                {availableTypes.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="duration"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Duration (minutes)</FormLabel>
              <Input {...field} type="number" min="15" step="15" />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <Textarea {...field} placeholder="Describe what mentees can expect from this session type" />
            </FormItem>
          )}
        />

        <div className="space-y-2">
          <Label>Meeting Platforms</Label>
          <div className="grid grid-cols-2 gap-4">
            {["Google Meet", "Zoom", "Telegram", "WhatsApp", "Phone Call"].map((platform) => (
              <div key={platform} className="flex items-center space-x-2">
                <Checkbox
                  id={platform}
                  checked={selectedPlatforms.includes(platform as MeetingPlatform)}
                  onCheckedChange={() => togglePlatform(platform as MeetingPlatform)}
                />
                <label
                  htmlFor={platform}
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  {platform}
                </label>
              </div>
            ))}
          </div>
        </div>

        {selectedPlatforms.includes("Telegram") && (
          <FormField
            control={form.control}
            name="telegram_username"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Telegram Username</FormLabel>
                <Input {...field} placeholder="@username" required />
              </FormItem>
            )}
          />
        )}

        {needsPhoneNumber && (
          <FormField
            control={form.control}
            name="phone_number"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Phone Number</FormLabel>
                <Input {...field} placeholder="+1 (919) 919-0000" required />
              </FormItem>
            )}
          />
        )}

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