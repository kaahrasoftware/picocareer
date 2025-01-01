import { useState } from "react";
import { useForm } from "react-hook-form";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { SESSION_TYPE_OPTIONS } from "@/types/session";
import type { SessionTypeEnum } from "@/types/session";
import type { Database } from "@/integrations/supabase/types";

type SessionType = Database["public"]["Tables"]["mentor_session_types"]["Row"];

interface SessionTypeFormProps {
  profileId: string;
  onSuccess: () => void;
  onCancel: () => void;
  existingTypes: SessionType[];
}

interface FormData {
  type: SessionTypeEnum;
  duration: number;
  description: string;
}

export function SessionTypeForm({ profileId, onSuccess, onCancel, existingTypes }: SessionTypeFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const { register, handleSubmit, formState: { errors }, watch } = useForm<FormData>();

  const availableTypes = SESSION_TYPE_OPTIONS.filter(
    type => !existingTypes.some(existing => existing.type === type)
  );

  const onSubmit = async (data: FormData) => {
    try {
      setIsSubmitting(true);
      console.log('Submitting session type:', data);

      const { error } = await supabase
        .from('mentor_session_types')
        .insert({
          profile_id: profileId,
          type: data.type,
          duration: data.duration,
          price: 0,
          description: data.description || null
        })
        .select()
        .single();

      if (error) throw error;

      toast({
        title: "Success",
        description: "Session type created successfully",
      });

      onSuccess();
    } catch (error) {
      console.error('Error creating session type:', error);
      toast({
        title: "Error",
        description: "Failed to create session type. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 p-4 border rounded-lg">
      <div className="space-y-4">
        <div>
          <Select
            {...register("type", { required: "Session type is required" })}
            onValueChange={(value) => register("type").onChange({ target: { value } })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select session type" />
            </SelectTrigger>
            <SelectContent>
              {availableTypes.map((type) => (
                <SelectItem key={type} value={type}>
                  {type}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.type && (
            <p className="text-sm text-red-500 mt-1">{errors.type.message}</p>
          )}
        </div>

        <div>
          <Input
            type="number"
            placeholder="Duration (minutes)"
            {...register("duration", {
              required: "Duration is required",
              min: { value: 15, message: "Minimum duration is 15 minutes" },
              max: { value: 180, message: "Maximum duration is 180 minutes" }
            })}
          />
          {errors.duration && (
            <p className="text-sm text-red-500 mt-1">{errors.duration.message}</p>
          )}
        </div>

        <div>
          <Textarea
            placeholder="Description (optional)"
            {...register("description")}
          />
        </div>
      </div>

      <div className="flex justify-end gap-2">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={isSubmitting}
        >
          Cancel
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Creating..." : "Create Session Type"}
        </Button>
      </div>
    </form>
  );
}