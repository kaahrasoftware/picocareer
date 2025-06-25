import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { SessionTypeManager } from './SessionTypeManager';

interface MentorEditFormProps {
  profileId: string;
  initialData: any;
  onSuccess: () => void;
}

export function MentorEditForm({ profileId, initialData, onSuccess }: MentorEditFormProps) {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [sessionTypes, setSessionTypes] = useState([]);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors }
  } = useForm({
    defaultValues: initialData
  });

  useEffect(() => {
    // Populate form fields with initial data
    for (const key in initialData) {
      setValue(key, initialData[key]);
    }

    fetchSessionTypes();
  }, [initialData, setValue]);

  const fetchSessionTypes = async () => {
    try {
      const { data, error } = await supabase
        .from('mentor_session_types')
        .select('*')
        .eq('profile_id', profileId);

      if (error) {
        throw error;
      }

      setSessionTypes(data || []);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to fetch session types",
        variant: "destructive",
      });
    }
  };

  const onSubmit = async (data: any) => {
    setIsSubmitting(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update(data)
        .eq('id', profileId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Profile updated successfully",
      });

      onSuccess();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to update profile",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div>
        <Label htmlFor="first_name">First Name</Label>
        <Input
          id="first_name"
          type="text"
          {...register("first_name", { required: "First name is required" })}
        />
        {errors.first_name && (
          <p className="text-sm text-red-500">{errors.first_name.message}</p>
        )}
      </div>

      <div>
        <Label htmlFor="last_name">Last Name</Label>
        <Input
          id="last_name"
          type="text"
          {...register("last_name", { required: "Last name is required" })}
        />
        {errors.last_name && (
          <p className="text-sm text-red-500">{errors.last_name.message}</p>
        )}
      </div>

      <div>
        <Label htmlFor="headline">Headline</Label>
        <Input
          id="headline"
          type="text"
          {...register("headline")}
        />
      </div>

      <div>
        <Label htmlFor="bio">Bio</Label>
        <Textarea
          id="bio"
          className="min-h-[100px]"
          {...register("bio")}
        />
      </div>

      <Accordion type="multiple" className="w-full">
        <AccordionItem value="session-types">
          <AccordionTrigger>Session Types</AccordionTrigger>
          <AccordionContent>
            <SessionTypeManager
              profileId={profileId}
              sessionTypes={sessionTypes}
              onUpdate={() => {
                // Refresh session types
                fetchSessionTypes();
              }}
            />
          </AccordionContent>
        </AccordionItem>
      </Accordion>

      <div className="flex justify-end gap-2">
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Updating..." : "Update Profile"}
        </Button>
      </div>
    </form>
  );
}
