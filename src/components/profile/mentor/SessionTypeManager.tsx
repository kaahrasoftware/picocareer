import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";
import { Clock, DollarSign, FileText } from "lucide-react";

type SessionType = Database["public"]["Tables"]["mentor_session_types"]["Row"];

interface SessionTypeManagerProps {
  profileId: string;
  sessionTypes: SessionType[];
  onUpdate: () => void;
}

export function SessionTypeManager({ profileId, sessionTypes, onUpdate }: SessionTypeManagerProps) {
  const [type, setType] = React.useState<Database["public"]["Enums"]["session_type"]>("Introduction");
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
      setType("Introduction");
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

  const sessionTypeOptions: Database["public"]["Enums"]["session_type"][] = [
    "Introduction",
    "Quick-Advice",
    "Walkthrough",
    "Group (2-3 Mentees)",
    "Group (4-6 Mentees)"
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Session Types</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Existing Session Types */}
        {sessionTypes.length > 0 && (
          <div className="grid gap-4">
            {sessionTypes.map((sessionType) => (
              <div 
                key={sessionType.id} 
                className="bg-muted/50 p-4 rounded-lg space-y-2"
              >
                <h4 className="font-medium text-lg">{sessionType.type}</h4>
                <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    {sessionType.duration} minutes
                  </div>
                  <div className="flex items-center gap-1">
                    <DollarSign className="h-4 w-4" />
                    ${sessionType.price}
                  </div>
                </div>
                {sessionType.description && (
                  <div className="flex items-start gap-1 text-sm">
                    <FileText className="h-4 w-4 mt-1 flex-shrink-0" />
                    <p>{sessionType.description}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Add New Session Type Form */}
        <div className="space-y-4 pt-4 border-t">
          <h3 className="font-medium text-lg">Add New Session Type</h3>
          
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Session Type</label>
              <Select
                value={type}
                onValueChange={(value: Database["public"]["Enums"]["session_type"]) => setType(value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select session type" />
                </SelectTrigger>
                <SelectContent>
                  {sessionTypeOptions.map((type) => (
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

            <Button 
              onClick={handleAddSessionType} 
              className="w-full"
              disabled={!type || !duration || !price}
            >
              Add Session Type
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
