
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import type { FormData } from "../HubGeneralSettings";
import { UseFormRegister } from "react-hook-form";

interface BasicInfoSectionProps {
  register: UseFormRegister<FormData>;
  errors: any;
}

export function BasicInfoSection({ register, errors }: BasicInfoSectionProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Basic Information</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <label htmlFor="name" className="text-sm font-medium">Hub Name</label>
          <Input
            id="name"
            {...register("name", { required: "Hub name is required" })}
          />
          {errors.name && (
            <p className="text-sm text-destructive">{errors.name.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <label htmlFor="description" className="text-sm font-medium">Description</label>
          <Textarea
            id="description"
            {...register("description")}
            rows={4}
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="website" className="text-sm font-medium">Website</label>
          <Input
            id="website"
            type="url"
            {...register("website")}
            placeholder="https://..."
          />
        </div>
      </CardContent>
    </Card>
  );
}
