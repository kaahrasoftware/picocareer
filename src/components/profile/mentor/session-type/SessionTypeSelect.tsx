import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { useState } from "react";
import { SESSION_TYPE_OPTIONS, SESSION_TYPE_DESCRIPTIONS, SessionTypeEnum } from "@/types/session";
import type { SessionTypeSelectProps } from "./types";

export function SessionTypeSelect({ form, availableTypes }: SessionTypeSelectProps) {
  const [showDialog, setShowDialog] = useState(false);
  const [selectedType, setSelectedType] = useState<SessionTypeEnum | null>(null);

  const handleTypeSelect = (value: string) => {
    const type = value as SessionTypeEnum;
    setSelectedType(type);
    setShowDialog(true);
  };

  return (
    <>
      <FormField
        control={form.control}
        name="type"
        rules={{ required: "Session type is required" }}
        render={({ field }) => (
          <FormItem>
            <FormLabel>Session Type</FormLabel>
            <Select 
              onValueChange={(value) => {
                field.onChange(value);
                handleTypeSelect(value);
              }} 
              defaultValue={field.value}
            >
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder="Select session type" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                {SESSION_TYPE_OPTIONS.filter(type => !availableTypes.includes(type)).map((type) => (
                  <SelectItem key={type} value={type}>
                    {type}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )}
      />

      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>{selectedType}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <DialogDescription className="text-sm text-muted-foreground pt-2 select-text">
              {selectedType && SESSION_TYPE_DESCRIPTIONS[selectedType]}
            </DialogDescription>
            <p className="text-xs text-muted-foreground italic">
              Tip: You can select and copy this description to use in your session details.
            </p>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}