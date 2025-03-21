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
import { SessionTypeEnum, MeetingPlatform, SESSION_TYPE_OPTIONS } from "@/types/session";

interface SessionTypeData {
  id?: string;
  type: SessionTypeEnum;
  duration: number;
  price: number;
  description: string | null;
  meeting_platform?: MeetingPlatform[];
}

interface SpecializationData {
  career: { title: string; id: string } | null;
  major: { title: string; id: string } | null;
  years_of_experience: number;
}

interface MentorEditFormProps {
  profile: Profile;
  mentorData: {
    sessionTypes: SessionTypeData[];
    specializations: SpecializationData[];
  } | null;
  setIsEditing: (value: boolean) => void;
}

export function MentorEditForm({ profile, mentorData, setIsEditing }: MentorEditFormProps) {
  const [sessionTypes, setSessionTypes] = useState<SessionTypeData[]>(
    mentorData?.sessionTypes || []
  );
  const [specializations, setSpecializations] = useState<SpecializationData[]>(
    mentorData?.specializations || []
  );
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      // First, delete existing session types for this profile
      const { error: deleteError } = await supabase
        .from('mentor_session_types')
        .delete()
        .eq('profile_id', profile.id);

      if (deleteError) throw deleteError;

      // Then insert new session types
      const { error: sessionError } = await supabase
        .from('mentor_session_types')
        .insert(
          sessionTypes.map(session => ({
            profile_id: profile.id,
            type: session.type,
            duration: session.duration,
            price: session.price,
            description: session.description,
            meeting_platform: ["Google Meet"] as MeetingPlatform[]
          }))
        );

      if (sessionError) throw sessionError;

      // Update specializations
      const { error: specError } = await supabase
        .from('mentor_specializations')
        .upsert(specializations.map(spec => ({
          profile_id: profile.id,
          career_id: spec.career?.id || '',
          major_id: spec.major?.id || '',
          years_of_experience: spec.years_of_experience
        })));

      if (specError) throw specError;

      await queryClient.invalidateQueries({ queryKey: ['mentor-details'] });
      
      toast({
        title: "Success",
        description: "Mentor details updated successfully",
      });
      
      setIsEditing(false);
    } catch (error) {
      console.error('Error updating mentor details:', error);
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
              onValueChange={(value: SessionTypeEnum) => {
                const newTypes = [...sessionTypes];
                newTypes[index] = { ...newTypes[index], type: value };
                setSessionTypes(newTypes);
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select session type" />
              </SelectTrigger>
              <SelectContent>
                {SESSION_TYPE_OPTIONS.map((type) => (
                  <SelectItem key={type} value={type}>
                    {type}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Input
              type="number"
              value={session.duration}
              onChange={(e) => {
                const newTypes = [...sessionTypes];
                newTypes[index] = { ...newTypes[index], duration: parseInt(e.target.value) || 0 };
                setSessionTypes(newTypes);
              }}
              placeholder="Duration (minutes)"
            />

            <Input
              type="number"
              value={session.price}
              onChange={(e) => {
                const newTypes = [...sessionTypes];
                newTypes[index] = { ...newTypes[index], price: parseInt(e.target.value) || 0 };
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
            type: "Know About my Career",
            duration: 30,
            price: 0,
            description: null,
            meeting_platform: ["Google Meet"]
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