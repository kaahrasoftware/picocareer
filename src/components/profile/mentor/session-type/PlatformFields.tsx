import { Control } from "react-hook-form";
import { SessionTypeFormData } from "@/types/session";
import { PlatformSelect } from "./PlatformSelect";

export interface PlatformFieldsProps {
  form: {
    control: Control<SessionTypeFormData>;
  };
  showTelegramField?: boolean;
  showPhoneField?: boolean;
  showWhatsAppField?: boolean;
}

export function PlatformFields({ form, showTelegramField, showPhoneField, showWhatsAppField }: PlatformFieldsProps) {
  return (
    <div className="space-y-4">
      <PlatformSelect form={form} />
      {showTelegramField && (
        <div>
          <label htmlFor="telegram_username">Telegram Username</label>
          <input
            id="telegram_username"
            {...form.control.register("telegram_username")}
            placeholder="Enter your Telegram username"
          />
        </div>
      )}
      {showPhoneField && (
        <div>
          <label htmlFor="phone_number">Phone Number</label>
          <input
            id="phone_number"
            {...form.control.register("phone_number")}
            placeholder="Enter your phone number"
          />
        </div>
      )}
      {showWhatsAppField && (
        <div>
          <label htmlFor="whatsapp_number">WhatsApp Number</label>
          <input
            id="whatsapp_number"
            {...form.control.register("whatsapp_number")}
            placeholder="Enter your WhatsApp number"
          />
        </div>
      )}
    </div>
  );
}
