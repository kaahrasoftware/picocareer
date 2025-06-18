import { useState, useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { Form } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { FormField } from "@/components/forms/FormField";
import { useToast } from "@/hooks/use-toast";
import { useAuthSession } from "@/hooks/useAuthSession";
import { useUserProfile } from "@/hooks/useUserProfile";
import { supabase } from "@/integrations/supabase/client";
import { MentorSessionType } from "@/types/database/mentors";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Plus, Trash2 } from "lucide-react";
import type { Profile } from "@/types/database/profiles";

type MeetingPlatform = 'WhatsApp' | 'Google Meet' | 'Telegram' | 'Phone Call' | 'Zoom';

interface FormFields {
  sessionTypes: MentorSessionType[];
}

interface MentorEditFormProps {
  profile: Profile;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export function MentorEditForm({ profile, onSuccess, onCancel }: MentorEditFormProps) {
  const { toast } = useToast();
  const { session } = useAuthSession();
  const { data: userProfile } = useUserProfile(session);
  const [sessionTypes, setSessionTypes] = useState<MentorSessionType[]>([]);

  useEffect(() => {
    const fetchSessionTypes = async () => {
      if (!profile?.id) return;

      const { data, error } = await supabase
        .from('mentor_session_types')
        .select('*')
        .eq('profile_id', profile.id);

      if (error) {
        console.error('Error fetching session types:', error);
        toast({
          title: "Error",
          description: "Failed to load session types. Please try again.",
          variant: "destructive",
        });
        return;
      }

      const convertPlatformFromDb = (platforms: string[]): MeetingPlatform[] => {
        const platformMap: Record<string, MeetingPlatform> = {
          'WhatsApp': 'WhatsApp',
          'Google Meet': 'Google Meet',
          'Telegram': 'Telegram',
          'Phone Call': 'Phone Call',
          'Zoom': 'Zoom'
        };
        return platforms.map(p => platformMap[p as MeetingPlatform] || p as MeetingPlatform);
      };

      setSessionTypes(data.map(sessionType => ({
        ...sessionType,
        meeting_platform: convertPlatformFromDb(sessionType.meeting_platform as string[])
      })));
    };

    fetchSessionTypes();
  }, [profile?.id, toast]);

  const convertPlatformToDb = (platforms: MeetingPlatform[]): string[] => {
    const platformMap: Record<MeetingPlatform, string> = {
      'WhatsApp': 'WhatsApp',
      'Google Meet': 'Google Meet', 
      'Telegram': 'Telegram',
      'Phone Call': 'Phone Call',
      'Zoom': 'Zoom'
    };
    return platforms.map(p => platformMap[p] || p);
  };

  const form = useForm<FormFields>({
    defaultValues: {
      sessionTypes: []
    }
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (!userProfile?.id) {
        toast({
          title: "Authentication Required",
          description: "Please sign in to update your profile.",
          variant: "destructive",
        });
        return;
      }

      // Delete existing session types
      await supabase
        .from('mentor_session_types')
        .delete()
        .eq('profile_id', profile?.id);

      // Insert new session types with proper enum conversion
      if (sessionTypes.length > 0) {
        const sessionTypesToInsert = sessionTypes.map(sessionType => ({
          profile_id: profile?.id,
          type: sessionType.type,
          duration: sessionType.duration,
          price: sessionType.price,
          description: sessionType.description,
          meeting_platform: sessionType.meeting_platform.map(platform => {
            // Convert frontend enum values to database enum values
            switch (platform) {
              case "whatsapp":
                return "WhatsApp";
              case "google_meet":
                return "Google Meet";
              case "telegram":
                return "Telegram";
              case "phone_call":
                return "Phone Call";
              default:
                return platform;
            }
          })
        }));

        const { error: sessionTypesError } = await supabase
          .from('mentor_session_types')
          .insert(sessionTypesToInsert);

        if (sessionTypesError) throw sessionTypesError;
      }

      toast({
        title: "Success",
        description: "Mentor profile updated successfully.",
      });

      if (onSuccess) onSuccess();
    } catch (error) {
      console.error('Error updating mentor profile:', error);
      toast({
        title: "Error",
        description: "Failed to update mentor profile. Please try again.",
        variant: "destructive"
      });
    }
  };

  const addSessionType = () => {
    setSessionTypes([
      ...sessionTypes,
      {
        profile_id: profile.id,
        type: "",
        duration: 30,
        price: 0,
        description: "",
        meeting_platform: []
      }
    ]);
  };

  const updateSessionType = (index: number, field: string, value: any) => {
    const updatedSessionTypes = [...sessionTypes];
    updatedSessionTypes[index][field] = value;
    setSessionTypes(updatedSessionTypes);
  };

  const updateMeetingPlatforms = (index: number, platform: MeetingPlatform, checked: boolean) => {
    const updatedSessionTypes = [...sessionTypes];
    const currentPlatforms = updatedSessionTypes[index].meeting_platform || [];

    if (checked) {
      updatedSessionTypes[index].meeting_platform = [...currentPlatforms, platform];
    } else {
      updatedSessionTypes[index].meeting_platform = currentPlatforms.filter(p => p !== platform);
    }

    setSessionTypes(updatedSessionTypes);
  };

  const deleteSessionType = (index: number) => {
    const updatedSessionTypes = [...sessionTypes];
    updatedSessionTypes.splice(index, 1);
    setSessionTypes(updatedSessionTypes);
  };

  const meetingPlatforms: MeetingPlatform[] = ['WhatsApp', 'Google Meet', 'Telegram', 'Phone Call', 'Zoom'];

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        <div className="space-y-4">
          <h3 className="text-xl font-semibold">Session Types</h3>
          <p className="text-sm text-muted-foreground">
            Define the types of mentorship sessions you offer.
          </p>
          <Separator />
          <ScrollArea className="h-[400px] rounded-md border p-4">
            <div className="space-y-4">
              {sessionTypes.map((sessionType, index) => (
                <div key={index} className="space-y-2 border rounded-md p-4">
                  <div className="flex justify-between items-center">
                    <h4 className="text-lg font-medium">Session Type {index + 1}</h4>
                    <Button
                      type="button"
                      variant="destructive"
                      size="icon"
                      onClick={() => deleteSessionType(index)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor={`type-${index}`}>Type</Label>
                      <Input
                        type="text"
                        id={`type-${index}`}
                        value={sessionType.type}
                        onChange={(e) => updateSessionType(index, "type", e.target.value)}
                        placeholder="e.g., Career Advice, Resume Review"
                      />
                    </div>
                    <div>
                      <Label htmlFor={`duration-${index}`}>Duration (minutes)</Label>
                      <Select
                        value={String(sessionType.duration)}
                        onValueChange={(value) => updateSessionType(index, "duration", parseInt(value))}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select duration" />
                        </SelectTrigger>
                        <SelectContent>
                          {[30, 60, 90, 120].map((duration) => (
                            <SelectItem key={duration} value={String(duration)}>
                              {duration} minutes
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor={`price-${index}`}>Price</Label>
                      <Input
                        type="number"
                        id={`price-${index}`}
                        value={String(sessionType.price)}
                        onChange={(e) => updateSessionType(index, "price", parseFloat(e.target.value))}
                        placeholder="e.g., 50"
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor={`description-${index}`}>Description</Label>
                    <Textarea
                      id={`description-${index}`}
                      value={sessionType.description}
                      onChange={(e) => updateSessionType(index, "description", e.target.value)}
                      placeholder="Brief description of the session type"
                    />
                  </div>
                  <div>
                    <Label>Meeting Platforms</Label>
                    <div className="flex flex-wrap gap-2">
                      {meetingPlatforms.map((platform) => (
                        <div key={platform} className="flex items-center space-x-2">
                          <Checkbox
                            id={`platform-${index}-${platform}`}
                            checked={sessionType.meeting_platform?.includes(platform)}
                            onCheckedChange={(checked) => updateMeetingPlatforms(index, platform, !!checked)}
                          />
                          <Label htmlFor={`platform-${index}-${platform}`}>{platform}</Label>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
          <Button type="button" variant="secondary" onClick={addSessionType}>
            <Plus className="h-4 w-4 mr-2" />
            Add Session Type
          </Button>
        </div>

        <div className="flex justify-end gap-4">
          {onCancel && (
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancel
            </Button>
          )}
          <Button type="submit">
            {form.formState.isSubmitting ? "Updating..." : "Update Profile"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
