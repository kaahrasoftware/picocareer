
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useFormContext } from "react-hook-form";

interface PlatformFieldsProps {
  showTelegramField: boolean;
  showPhoneField: boolean;
  showWhatsAppField: boolean;
}

export function PlatformFields({ showTelegramField, showPhoneField, showWhatsAppField }: PlatformFieldsProps) {
  const { control } = useFormContext();

  return (
    <>
      {showTelegramField && (
        <FormField
          control={control}
          name="telegram_username"
          rules={{ required: "Telegram username is required for Telegram sessions" }}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Telegram Username</FormLabel>
              <FormControl>
                <Input 
                  {...field} 
                  placeholder="@username"
                  onChange={(e) => {
                    let value = e.target.value;
                    if (!value.startsWith('@') && value) {
                      value = '@' + value;
                    }
                    field.onChange(value);
                  }}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      )}

      {(showPhoneField || showWhatsAppField) && (
        <FormField
          control={control}
          name="phone_number"
          rules={{ required: "Phone number is required for phone call/WhatsApp sessions" }}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Phone Number</FormLabel>
              <FormControl>
                <Input {...field} placeholder="+1234567890" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      )}
    </>
  );
}
