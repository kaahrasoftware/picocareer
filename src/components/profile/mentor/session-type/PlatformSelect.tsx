import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { UseFormReturn } from "react-hook-form";
import { SessionTypeFormData } from "./types";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from "@/components/ui/command";
import { Badge } from "@/components/ui/badge";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";

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
  const selectedPlatforms = form.watch("meeting_platform") || [];

  return (
    <FormField
      control={form.control}
      name="meeting_platform"
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
                  {field.value?.length > 0
                    ? `${field.value.length} platform${field.value.length > 1 ? "s" : ""} selected`
                    : "Select platforms"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-full p-0">
                <Command>
                  <CommandInput placeholder="Search platforms..." />
                  <CommandEmpty>No platform found.</CommandEmpty>
                  <CommandGroup>
                    {platforms.map((platform) => (
                      <CommandItem
                        key={platform}
                        onSelect={() => {
                          const newValue = field.value || [];
                          if (newValue.includes(platform)) {
                            field.onChange(newValue.filter(x => x !== platform));
                          } else {
                            field.onChange([...newValue, platform]);
                          }
                        }}
                      >
                        <div
                          className={cn(
                            "mr-2 flex h-4 w-4 items-center justify-center rounded-sm border border-primary",
                            field.value?.includes(platform)
                              ? "bg-primary text-primary-foreground"
                              : "opacity-50 [&_svg]:invisible"
                          )}
                        >
                          <svg
                            className={cn("h-4 w-4")}
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                            strokeWidth={2}
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M5 13l4 4L19 7"
                            />
                          </svg>
                        </div>
                        {platform}
                      </CommandItem>
                    ))}
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
                      field.onChange(selectedPlatforms.filter(p => p !== platform));
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