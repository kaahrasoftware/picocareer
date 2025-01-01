import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from "@/components/ui/command";
import { Badge } from "@/components/ui/badge";
import { X, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { UseFormReturn } from "react-hook-form";
import { SessionTypeFormData } from "./types";

interface PlatformSelectProps {
  form: UseFormReturn<SessionTypeFormData>;
}

const platforms = [
  "Google Meet",
  "WhatsApp",
  "Telegram",
  "Phone Call"
] as const;

export function PlatformSelect({ form }: PlatformSelectProps) {
  const selectedPlatforms = form.watch("meeting_platform") ?? [];

  return (
    <FormField
      control={form.control}
      name="meeting_platform"
      defaultValue={[]}
      rules={{ required: "At least one platform is required" }}
      render={({ field }) => (
        <FormItem>
          <FormLabel>Meeting Platform</FormLabel>
          <FormControl>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  role="combobox"
                  className={cn(
                    "w-full justify-between",
                    !field.value?.length && "text-muted-foreground"
                  )}
                >
                  {(field.value?.length ?? 0) > 0
                    ? `${field.value?.length ?? 0} platform${(field.value?.length ?? 0) > 1 ? "s" : ""} selected`
                    : "Select platforms"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-full p-0">
                <Command>
                  <CommandInput placeholder="Search platforms..." />
                  <CommandEmpty>No platform found.</CommandEmpty>
                  <CommandGroup>
                    {platforms.map((platform) => {
                      const isSelected = (field.value ?? []).includes(platform);
                      return (
                        <CommandItem
                          key={platform}
                          onSelect={() => {
                            const currentValue = field.value ?? [];
                            if (currentValue.includes(platform)) {
                              form.setValue(
                                "meeting_platform",
                                currentValue.filter(x => x !== platform),
                                { shouldValidate: true }
                              );
                            } else {
                              form.setValue(
                                "meeting_platform",
                                [...currentValue, platform],
                                { shouldValidate: true }
                              );
                            }
                          }}
                          className="flex items-center gap-2 px-4 py-2"
                        >
                          <div className="flex h-4 w-4 items-center justify-center rounded-sm border border-primary">
                            {isSelected && (
                              <Check className="h-3 w-3 text-primary" />
                            )}
                          </div>
                          <span className="flex-1">{platform}</span>
                        </CommandItem>
                      );
                    })}
                  </CommandGroup>
                </Command>
              </PopoverContent>
            </Popover>
          </FormControl>
          {selectedPlatforms.length > 0 && (
            <div className="flex gap-2 flex-wrap mt-2">
              {selectedPlatforms.map((platform) => (
                <Badge
                  key={platform}
                  variant="secondary"
                  className="flex items-center gap-1"
                >
                  {platform}
                  <X
                    className="h-3 w-3 cursor-pointer"
                    onClick={() => {
                      form.setValue(
                        "meeting_platform",
                        selectedPlatforms.filter(p => p !== platform),
                        { shouldValidate: true }
                      );
                    }}
                  />
                </Badge>
              ))}
            </div>
          )}
          <FormMessage />
        </FormItem>
      )}
    />
  );
}