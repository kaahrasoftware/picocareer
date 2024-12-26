import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface SessionType {
  id: string;
  type: string;
  duration: number;
  price: number;
  description: string | null;
}

interface SessionTypeManagerProps {
  profileId: string;
  sessionTypes: SessionType[];
  onUpdate: () => void;
}

export function SessionTypeManager({ profileId, sessionTypes, onUpdate }: SessionTypeManagerProps) {
  const [type, setType] = React.useState('Introduction');
  const [duration, setDuration] = React.useState('30');
  const [price, setPrice] = React.useState('0');
  const [description, setDescription] = React.useState('');
  const { toast } = useToast();

  const handleAddSessionType = async () => {
    try {
      const { error } = await supabase
        .from('mentor_session_types')
        .insert({
          profile_id: profileId,
          type,
          duration: parseInt(duration),
          price: parseInt(price),
          description
        });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Session type added successfully",
      });
      
      onUpdate();
      
      // Reset form
      setType('Introduction');
      setDuration('30');
      setPrice('0');
      setDescription('');
    } catch (error) {
      console.error('Error adding session type:', error);
      toast({
        title: "Error",
        description: "Failed to add session type",
        variant: "destructive",
      });
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Session Types</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-4">
          {sessionTypes.map((sessionType) => (
            <div key={sessionType.id} className="flex items-center justify-between p-4 border rounded-lg">
              <div>
                <h4 className="font-medium">{sessionType.type}</h4>
                <p className="text-sm text-muted-foreground">
                  {sessionType.duration} minutes - ${sessionType.price}
                </p>
                {sessionType.description && (
                  <p className="text-sm mt-1">{sessionType.description}</p>
                )}
              </div>
            </div>
          ))}
        </div>

        <div className="space-y-4 pt-4 border-t">
          <Select value={type} onValueChange={setType}>
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
            value={duration}
            onChange={(e) => setDuration(e.target.value)}
            placeholder="Duration (minutes)"
          />

          <Input
            type="number"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            placeholder="Price ($)"
          />

          <Textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Description"
          />

          <Button onClick={handleAddSessionType} className="w-full">
            Add Session Type
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}