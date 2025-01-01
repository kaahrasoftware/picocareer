import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { SessionTypeEnum, SESSION_TYPE_OPTIONS, MeetingPlatform } from "@/types/session";

interface SessionTypeFormProps {
  onSubmit: (data: {
    type: SessionTypeEnum;
    duration: string;
    price: string;
    description: string;
    meeting_platform: MeetingPlatform[];
  }) => void;
  onCancel: () => void;
  existingTypes: SessionTypeEnum[];
}

const PLATFORM_OPTIONS: MeetingPlatform[] = ["Google Meet", "WhatsApp", "Telegram", "Phone Call"];

export function SessionTypeForm({ onSubmit, onCancel, existingTypes }: SessionTypeFormProps) {
  const [type, setType] = useState<SessionTypeEnum>("First Touch");
  const [duration, setDuration] = useState('30');
  const [description, setDescription] = useState('');
  const [selectedPlatforms, setSelectedPlatforms] = useState<MeetingPlatform[]>(["Google Meet"]);

  // Filter out already used session types
  const availableTypes = SESSION_TYPE_OPTIONS.filter(type => !existingTypes.includes(type));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({ 
      type, 
      duration, 
      price: '0', // Set default price to 0
      description,
      meeting_platform: selectedPlatforms
    });
  };

  const togglePlatform = (platform: MeetingPlatform) => {
    setSelectedPlatforms(current => 
      current.includes(platform)
        ? current.filter(p => p !== platform)
        : [...current, platform]
    );
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
        <label className="text-sm font-medium">Description</label>
        <Textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Describe what mentees can expect from this session type"
          className="h-24"
        />
      </div>

      <div className="space-y-2">
        <Label className="text-sm font-medium">Meeting Platforms</Label>
        <div className="grid grid-cols-2 gap-4">
          {PLATFORM_OPTIONS.map((platform) => (
            <div key={platform} className="flex items-center space-x-2">
              <Checkbox
                id={platform}
                checked={selectedPlatforms.includes(platform)}
                onCheckedChange={() => togglePlatform(platform)}
              />
              <Label htmlFor={platform} className="text-sm">
                {platform}
              </Label>
            </div>
          ))}
        </div>
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