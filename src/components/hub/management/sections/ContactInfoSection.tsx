
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import type { FormData } from "../HubGeneralSettings";
import { UseFormRegister } from "react-hook-form";

interface ContactInfoSectionProps {
  register: UseFormRegister<FormData>;
}

export function ContactInfoSection({ register }: ContactInfoSectionProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Contact Information</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <label htmlFor="email" className="text-sm font-medium">Email</label>
          <Input
            id="email"
            type="email"
            {...register("contact_info.email")}
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="phone" className="text-sm font-medium">Phone</label>
          <Input
            id="phone"
            {...register("contact_info.phone")}
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="address" className="text-sm font-medium">Address</label>
          <Textarea
            id="address"
            {...register("contact_info.address")}
          />
        </div>
      </CardContent>
    </Card>
  );
}
