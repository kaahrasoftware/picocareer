import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Control, useFormContext } from "react-hook-form";
import { SessionTypeFormData } from "./types";
import { Badge } from "@/components/ui/badge";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { MeetingPlatform } from "@/types/session";

interface PlatformSelectProps {
  form: {
    control: Control<SessionTypeFormData>;
  };
}

export function PlatformSelect({ form }: PlatformSelectProps) {
  const [selectedPlatforms, setSelectedPlatforms] = useState<MeetingPlatform[]>([]);
  const methods = useFormContext<SessionTypeFormData>();

  useEffect(() => {
    const subscription = methods.watch((value) => {
      if (value.meeting_platform) {
        setSelectedPlatforms(value.meeting_platform as MeetingPlatform[]);
      }
    });

    return () => subscription.unsubscribe();
  }, [methods.watch]);

  const handlePlatformSelect = (value: MeetingPlatform) => {
    if (!selectedPlatforms.includes(value)) {
      const newPlatforms = [...selectedPlatforms, value];
      setSelectedPlatforms(newPlatforms);
      methods.setValue('meeting_platform', newPlatforms, { 
        shouldValidate: true,
        shouldDirty: true,
        shouldTouch: true 
      });
    }
  };

  const removePlatform = (platform: MeetingPlatform) => {
    const newPlatforms = selectedPlatforms.filter(p => p !== platform);
    setSelectedPlatforms(newPlatforms);
    methods.setValue('meeting_platform', newPlatforms, {
      shouldValidate: true,
      shouldDirty: true,
      shouldTouch: true
    });
  };

  return (
    <FormField
      control={form.control}
      name="meeting_platform"
      rules={{ required: "At least one platform is required" }}
      render={({ field }) => (
        <FormItem>
          <FormLabel>Meeting Platforms</FormLabel>
          <div className="space-y-2">
            <div className="flex flex-wrap gap-2 min-h-[2.5rem]">
              {selectedPlatforms.map((platform) => (
                <Badge key={platform} variant="secondary" className="gap-1">
                  {platform}
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-4 w-4 p-0 hover:bg-transparent"
                    onClick={() => removePlatform(platform)}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </Badge>
              ))}
            </div>
            <FormControl>
              <Select onValueChange={handlePlatformSelect}>
                <SelectTrigger>
                  <SelectValue placeholder="Select platforms" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Google Meet">Google Meet</SelectItem>
                  <SelectItem value="WhatsApp">WhatsApp</SelectItem>
                  <SelectItem value="Telegram">Telegram</SelectItem>
                  <SelectItem value="Phone Call">Phone Call</SelectItem>
                </SelectContent>
              </Select>
            </FormControl>
            <FormMessage />
          </div>
        </FormItem>
      )}
    />
  );
}