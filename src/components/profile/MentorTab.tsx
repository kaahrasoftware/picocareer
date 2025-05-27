import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Edit, Trash2, Clock, DollarSign, Users } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface SessionType {
  id: string;
  type: string;
  duration: number;
  price: number;
  token_cost: number;
  description?: string;
  custom_type_name?: string;
  meeting_platform?: string[];
  telegram_username?: string;
  phone_number?: string;
  created_at: string;
  updated_at: string;
}

interface MentorTabProps {
  profileId: string;
}

export function MentorTab({ profileId }: MentorTabProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingSession, setEditingSession] = useState<SessionType | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const sessionTypesMutation = useMutation({
    mutationFn: async (values: Omit<SessionType, 'id' | 'created_at' | 'updated_at'> & { id?: string }) => {
      if (values.id) {
        // Update existing session type
        const { data, error } = await supabase
          .from('mentor_session_types')
          .update(values)
          .eq('id', values.id);
        if (error) throw error;
        return data;
      } else {
        // Create new session type
        const { data, error } = await supabase
          .from('mentor_session_types')
          .insert([{ ...values, profile_id: profileId }]);
        if (error) throw error;
        return data;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['mentor-session-types', profileId] });
      toast({
        title: "Success",
        description: "Session type saved successfully.",
      });
      setIsDialogOpen(false);
      setEditingSession(null);
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to save session type.",
        variant: "destructive",
      });
    },
  });

  const deleteSessionTypeMutation = useMutation({
    mutationFn: async (id: string) => {
      const { data, error } = await supabase
        .from('mentor_session_types')
        .delete()
        .eq('id', id);
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['mentor-session-types', profileId] });
      toast({
        title: "Success",
        description: "Session type deleted successfully.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to delete session type.",
        variant: "destructive",
      });
    },
  });
  
  const { data: sessionTypes = [], isLoading } = useQuery({
    queryKey: ['mentor-session-types', profileId],
    queryFn: async (): Promise<SessionType[]> => {
      const { data, error } = await supabase
        .from('mentor_session_types')
        .select('*')
        .eq('profile_id', profileId)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data.map(item => ({
        ...item,
        custom_type_name: item.custom_type_name || '',
        description: item.description || '',
        telegram_username: item.telegram_username || '',
        phone_number: item.phone_number || ''
      }));
    }
  });

  const SessionTypeForm = ({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) => {
    const [type, setType] = useState(editingSession?.type || 'consultation');
    const [duration, setDuration] = useState(editingSession?.duration || 30);
    const [price, setPrice] = useState(editingSession?.price || 50);
    const [tokenCost, setTokenCost] = useState(editingSession?.token_cost || 0);
    const [description, setDescription] = useState(editingSession?.description || '');
    const [customTypeName, setCustomTypeName] = useState(editingSession?.custom_type_name || '');
    const [meetingPlatforms, setMeetingPlatforms] = useState<string[]>(editingSession?.meeting_platform || []);
    const [telegramUsername, setTelegramUsername] = useState(editingSession?.telegram_username || '');
    const [phoneNumber, setPhoneNumber] = useState(editingSession?.phone_number || '');

    const handleSubmit = async () => {
      const values = {
        id: editingSession?.id,
        type,
        duration,
        price,
        token_cost: tokenCost,
        description,
        custom_type_name: customTypeName,
        meeting_platform: meetingPlatforms,
        telegram_username: telegramUsername,
        phone_number: phoneNumber
      };
      sessionTypesMutation.mutate(values);
    };

    return (
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {editingSession ? 'Edit Session Type' : 'Add New Session Type'}
          </DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <label htmlFor="type" className="text-right">
              Type
            </label>
            <Select value={type} onValueChange={setType} className="col-span-3">
              <SelectTrigger>
                <SelectValue placeholder="Select a type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="consultation">Consultation</SelectItem>
                <SelectItem value="mentoring">Mentoring</SelectItem>
                <SelectItem value="coaching">Coaching</SelectItem>
                <SelectItem value="custom">Custom</SelectItem>
              </SelectContent>
            </Select>
          </div>
          {type === 'custom' && (
            <div className="grid grid-cols-4 items-center gap-4">
              <label htmlFor="customTypeName" className="text-right">
                Custom Type Name
              </label>
              <Input
                id="customTypeName"
                value={customTypeName}
                onChange={(e) => setCustomTypeName(e.target.value)}
                className="col-span-3"
              />
            </div>
          )}
          <div className="grid grid-cols-4 items-center gap-4">
            <label htmlFor="duration" className="text-right">
              Duration (minutes)
            </label>
            <Input
              type="number"
              id="duration"
              value={String(duration)}
              onChange={(e) => setDuration(Number(e.target.value))}
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <label htmlFor="price" className="text-right">
              Price ($)
            </label>
            <Input
              type="number"
              id="price"
              value={String(price)}
              onChange={(e) => setPrice(Number(e.target.value))}
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <label htmlFor="tokenCost" className="text-right">
              Token Cost
            </label>
            <Input
              type="number"
              id="tokenCost"
              value={String(tokenCost)}
              onChange={(e) => setTokenCost(Number(e.target.value))}
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-4 items-start gap-4">
            <label htmlFor="description" className="text-right mt-2">
              Description
            </label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <label htmlFor="meetingPlatforms" className="text-right">
              Meeting Platforms
            </label>
            <Select
              value={meetingPlatforms[0] || ''}
              onValueChange={(value) => {
                if (meetingPlatforms.includes(value)) {
                  setMeetingPlatforms(meetingPlatforms.filter((platform) => platform !== value));
                } else {
                  setMeetingPlatforms([...meetingPlatforms, value]);
                }
              }}
              className="col-span-3"
            >
              <SelectTrigger>
                <SelectValue placeholder="Select platforms" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="zoom">Zoom</SelectItem>
                <SelectItem value="google_meet">Google Meet</SelectItem>
                <SelectItem value="telegram">Telegram</SelectItem>
                <SelectItem value="phone">Phone</SelectItem>
              </SelectContent>
            </Select>
          </div>
          {meetingPlatforms.includes('telegram') && (
            <div className="grid grid-cols-4 items-center gap-4">
              <label htmlFor="telegramUsername" className="text-right">
                Telegram Username
              </label>
              <Input
                id="telegramUsername"
                value={telegramUsername}
                onChange={(e) => setTelegramUsername(e.target.value)}
                className="col-span-3"
              />
            </div>
          )}
          {meetingPlatforms.includes('phone') && (
            <div className="grid grid-cols-4 items-center gap-4">
              <label htmlFor="phoneNumber" className="text-right">
                Phone Number
              </label>
              <Input
                id="phoneNumber"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                className="col-span-3"
              />
            </div>
          )}
        </div>
        <div className="flex justify-end">
          <Button type="button" variant="secondary" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button type="submit" onClick={handleSubmit}>
            {sessionTypesMutation.isLoading ? 'Saving...' : 'Save'}
          </Button>
        </div>
      </DialogContent>
    );
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader>
              <div className="h-4 bg-gray-200 rounded w-1/3"></div>
              <div className="h-3 bg-gray-200 rounded w-2/3"></div>
            </CardHeader>
            <CardContent>
              <div className="h-3 bg-gray-200 rounded w-1/2"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Session Types</h3>
          <p className="text-sm text-gray-600">Manage your mentoring session offerings</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => setEditingSession(null)}>
              <Plus className="h-4 w-4 mr-2" />
              Add Session Type
            </Button>
          </DialogTrigger>
          <SessionTypeForm open={isDialogOpen} onOpenChange={setIsDialogOpen} />
        </Dialog>
      </div>

      {sessionTypes.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No session types yet
            </h3>
            <p className="text-gray-500 mb-4">
              Create your first session type to start offering mentoring services.
            </p>
            <Button onClick={() => setIsDialogOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add Session Type
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {sessionTypes.map((sessionType) => (
            <Card key={sessionType.id} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base">
                    {sessionType.custom_type_name || sessionType.type}
                  </CardTitle>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => {
                        setEditingSession(sessionType);
                        setIsDialogOpen(true);
                      }}
                    >
                      <Edit className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
                {sessionType.description && (
                  <CardDescription>{sessionType.description}</CardDescription>
                )}
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-gray-500" />
                      <span className="text-sm">{sessionType.duration} minutes</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <DollarSign className="h-4 w-4 text-gray-500" />
                      <span className="text-sm">${sessionType.price}</span>
                    </div>
                  </div>
                  
                  {sessionType.token_cost > 0 && (
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-xs">
                        {sessionType.token_cost} tokens
                      </Badge>
                    </div>
                  )}
                  
                  {sessionType.meeting_platform && sessionType.meeting_platform.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {sessionType.meeting_platform.map((platform, index) => (
                        <Badge key={index} variant="secondary" className="text-xs">
                          {platform}
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
