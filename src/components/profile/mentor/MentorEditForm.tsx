import React, { useState } from "react";
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
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";
import type { Profile } from "@/types/database/profiles";

interface MentorEditFormProps {
  profile: Profile;
  mentorData: {
    sessionTypes: Array<{
      id: string;
      type: string;
      duration: number;
      price: number;
      description: string | null;
    }>;
    specializations: Array<{
      career: { title: string } | null;
      major: { title: string } | null;
      years_of_experience: number;
    }>;
  } | null;
  setIsEditing: (value: boolean) => void;
}

export function MentorEditForm({ profile, mentorData, setIsEditing }: MentorEditFormProps) {
  const [sessionTypes, setSessionTypes] = useState(mentorData?.sessionTypes || []);
  const [specializations, setSpecializations] = useState(mentorData?.specializations || []);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      // Update session types
      const { error: sessionError } = await supabase
        .from('mentor_session_types')
        .upsert(sessionTypes.map(session => ({
          ...session,
          profile_id: profile.id
        })));

      if (sessionError) throw sessionError;

      // Update specializations
      const { error: specError } = await supabase
        .from('mentor_specializations')
        .upsert(specializations.map(spec => ({
          ...spec,
          profile_id: profile.id
        })));

      if (specError) throw specError;

      await queryClient.invalidateQueries({ queryKey: ['mentor-details'] });
      
      toast({
        title: "Success",
        description: "Mentor details updated successfully",
      });
      
      setIsEditing(false);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update mentor details",
        variant: "destructive",
      });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Session Types */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Session Types</h3>
        {sessionTypes.map((session, index) => (
          <div key={index} className="space-y-4 p-4 border rounded-lg">
            <Select
              value={session.type}
              onValueChange={(value) => {
                const newTypes = [...sessionTypes];
                newTypes[index] = { ...newTypes[index], type: value };
                setSessionTypes(newTypes);
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select session type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Introduction">Introduction</SelectItem>
                <SelectItem value="Quick-Advice">Quick Advice</SelectItem>
                <SelectItem value="Walkthrough">Walkthrough</SelectItem>
                <SelectItem value="Group (2-3 Mentees)">Group (2-3 Mentees)</SelectItem>
                <SelectItem value="Group (4-6 Mentees)">Group (4-6 Mentees)</SelectItem>
              </SelectContent>
            </Select>

            <Input
              type="number"
              value={session.duration}
              onChange={(e) => {
                const newTypes = [...sessionTypes];
                newTypes[index] = { ...newTypes[index], duration: parseInt(e.target.value) };
                setSessionTypes(newTypes);
              }}
              placeholder="Duration (minutes)"
            />

            <Input
              type="number"
              value={session.price}
              onChange={(e) => {
                const newTypes = [...sessionTypes];
                newTypes[index] = { ...newTypes[index], price: parseInt(e.target.value) };
                setSessionTypes(newTypes);
              }}
              placeholder="Price ($)"
            />

            <Textarea
              value={session.description || ""}
              onChange={(e) => {
                const newTypes = [...sessionTypes];
                newTypes[index] = { ...newTypes[index], description: e.target.value };
                setSessionTypes(newTypes);
              }}
              placeholder="Description"
            />
          </div>
        ))}
        <Button
          type="button"
          variant="outline"
          onClick={() => setSessionTypes([...sessionTypes, {
            type: "Introduction",
            duration: 30,
            price: 0,
            description: "",
          }])}
        >
          Add Session Type
        </Button>
      </div>

      <div className="flex gap-4">
        <Button type="submit">Save Changes</Button>
        <Button 
          type="button" 
          variant="outline" 
          onClick={() => setIsEditing(false)}
        >
          Cancel
        </Button>
      </div>
    </form>
  );
}