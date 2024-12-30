import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { SessionTypeEnum, SESSION_TYPE_OPTIONS } from "@/types/session";

interface SessionTypeFormProps {
  onSubmit: (data: {
    type: SessionTypeEnum;
    duration: string;
    price: string;
    description: string;
  }) => void;
  onCancel: () => void;
  existingTypes: SessionTypeEnum[];
}

export function SessionTypeForm({ onSubmit, onCancel, existingTypes }: SessionTypeFormProps) {
  const [type, setType] = useState<SessionTypeEnum>("First Touch");
  const [duration, setDuration] = useState('30');
  const [price, setPrice] = useState('0');
  const [description, setDescription] = useState('');

  // Filter out already used session types
  const availableTypes = SESSION_TYPE_OPTIONS.filter(type => !existingTypes.includes(type));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({ type, duration, price, description });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <label className="text-sm font-medium">Session Type</label>
        <Select
          value={type}
          onValueChange={(value: SessionTypeEnum) => setType(value)}
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
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="text-sm font-medium">Duration (minutes)</label>
          <Input
            type="number"
            value={duration}
            onChange={(e) => setDuration(e.target.value)}
            placeholder="Duration (minutes)"
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Price ($)</label>
          <Input
            type="number"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            placeholder="Price ($)"
          />
        </div>
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium">Description</label>
        <Textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Describe what mentees can expect from this session type"
          className="h-24"
        />
      </div>

      <div className="flex gap-2 justify-end">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit">Add Session Type</Button>
      </div>
    </form>
  );
}