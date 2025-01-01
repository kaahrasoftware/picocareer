import { FormField, FormItem, FormLabel } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { UseFormReturn } from "react-hook-form";
import type { MeetingPlatform } from "@/types/calendar";

interface ContactInfoSectionProps {
  form: UseFormReturn<any>;
  selectedPlatforms: MeetingPlatform[];
}

export function ContactInfoSection({ form, selectedPlatforms }: ContactInfoSectionProps) {
  const needsPhoneNumber = selectedPlatforms.includes("WhatsApp") || selectedPlatforms.includes("Phone Call");
  
  return (
    <>
      {selectedPlatforms.includes("Telegram") && (
        <FormField
          control={form.control}
          name="telegram_username"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Telegram Username</FormLabel>
              <Input {...field} placeholder="@username" />
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
              <Input {...field} placeholder="+1 (919) 919-0000" />
            </FormItem>
          )}
        />
      )}
    </>
  );
}