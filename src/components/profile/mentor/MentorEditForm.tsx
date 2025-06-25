import React, { useState, useEffect } from 'react';
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"

import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/hooks/use-toast"
import { supabase } from "@/integrations/supabase/client"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { Plus, Trash2 } from "lucide-react"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Separator } from "@/components/ui/separator"
import { SelectWithCustomOption } from '../editable/SelectWithCustomOption';

const profileFormSchema = z.object({
  first_name: z.string().min(2, {
    message: "First name must be at least 2 characters.",
  }),
  last_name: z.string().min(2, {
    message: "Last name must be at least 2 characters.",
  }),
  title: z.string().optional(),
  bio: z.string().optional(),
  linkedin_url: z.string().url({ message: "Invalid LinkedIn URL" }).optional(),
  github_url: z.string().url({ message: "Invalid GitHub URL" }).optional(),
  website_url: z.string().url({ message: "Invalid Website URL" }).optional(),
  sessionTypes: z.array(
    z.object({
      type: z.string(),
      duration: z.number(),
      price: z.number(),
      description: z.string(),
      meeting_platform: z.string()
    })
  ).optional(),
})

// Define a type for the form data
export interface MentorFormData extends z.infer<typeof profileFormSchema> {}

interface MentorEditFormProps {
  mentor: any;
  onSuccess: () => void;
  onCancel: () => void;
}

export function MentorEditForm({ mentor, onSuccess, onCancel }: MentorEditFormProps) {
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)
  const [sessionTypes, setSessionTypes] = useState(mentor.sessionTypes || []);

  const form = useForm<MentorFormData>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      first_name: mentor.first_name || "",
      last_name: mentor.last_name || "",
      title: mentor.title || "",
      bio: mentor.bio || "",
      linkedin_url: mentor.linkedin_url || "",
      github_url: mentor.github_url || "",
      website_url: mentor.website_url || "",
      sessionTypes: mentor.sessionTypes || [],
    },
  })

  const handleSubmit = async (data: MentorFormData) => {
    setIsLoading(true);
    
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          first_name: data.first_name,
          last_name: data.last_name,
          title: data.title,
          bio: data.bio,
          linkedin_url: data.linkedin_url,
          github_url: data.github_url,
          website_url: data.website_url,
          updated_at: new Date().toISOString(),
        })
        .eq('id', mentor.id)

      if (error) {
        console.error('Profile update error:', error);
        throw error;
      }

      // Handle session types - insert them one by one instead of bulk insert
      if (data.sessionTypes && data.sessionTypes.length > 0) {
        // Delete existing session types
        await supabase
          .from('mentor_session_types')
          .delete()
          .eq('profile_id', mentor.id);

        // Insert new session types one by one
        for (const sessionType of data.sessionTypes) {
          const { error: sessionError } = await supabase
            .from('mentor_session_types')
            .insert({
              profile_id: mentor.id,
              type: sessionType.type,
              duration: sessionType.duration,
              price: sessionType.price,
              description: sessionType.description,
              meeting_platform: sessionType.meeting_platform as any,
            });

          if (sessionError) {
            console.error('Session type insert error:', sessionError);
            throw sessionError;
          }
        }
      }

      toast({
        title: "Success",
        description: "Profile updated successfully.",
      })
      onSuccess()
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Uh oh! Something went wrong.",
        description: error.message,
      })
    } finally {
      setIsLoading(false);
    }
  };

  const addSessionType = () => {
    setSessionTypes([
      ...sessionTypes,
      {
        id: Math.random().toString(36).substring(7),
        type: "",
        duration: 30,
        price: 50,
        description: "",
        meeting_platform: "Zoom",
      },
    ]);
  };

  const updateSessionType = (id: string, field: string, value: any) => {
    setSessionTypes((prevSessionTypes) =>
      prevSessionTypes.map((sessionType) =>
        sessionType.id === id ? { ...sessionType, [field]: value } : sessionType
      )
    );
  };

  const deleteSessionType = (id: string) => {
    setSessionTypes((prevSessionTypes) =>
      prevSessionTypes.filter((sessionType) => sessionType.id !== id)
    );
  };

  useEffect(() => {
    form.setValue("sessionTypes", sessionTypes);
  }, [sessionTypes, form.setValue]);

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <FormField
            control={form.control}
            name="first_name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>First name</FormLabel>
                <FormControl>
                  <Input placeholder="John" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="last_name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Last name</FormLabel>
                <FormControl>
                  <Input placeholder="Doe" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <FormField
            control={form.control}
            name="title"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Title</FormLabel>
                <FormControl>
                  <Input placeholder="Software Engineer" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="bio"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Bio</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Write a short bio about yourself"
                    className="resize-none"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <FormField
            control={form.control}
            name="linkedin_url"
            render={({ field }) => (
              <FormItem>
                <FormLabel>LinkedIn URL</FormLabel>
                <FormControl>
                  <Input placeholder="https://linkedin.com/in/johndoe" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="github_url"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Github URL</FormLabel>
                <FormControl>
                  <Input placeholder="https://github.com/johndoe" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="website_url"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Website URL</FormLabel>
                <FormControl>
                  <Input placeholder="https://johndoe.com" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div>
          <FormLabel>Session Types</FormLabel>
          <FormDescription>
            Add the types of sessions you offer.
          </FormDescription>
          <Separator className="my-4" />
          <Accordion type="multiple" collapsible>
            {sessionTypes.map((sessionType, index) => (
              <AccordionItem value={sessionType.id} key={sessionType.id}>
                <AccordionTrigger>
                  Session Type {index + 1}: {sessionType.type || "New Session"}
                </AccordionTrigger>
                <AccordionContent>
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    <div>
                      <FormItem>
                        <FormLabel>Type</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Consultation"
                            value={sessionType.type}
                            onChange={(e) =>
                              updateSessionType(
                                sessionType.id,
                                "type",
                                e.target.value
                              )
                            }
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    </div>
                    <div>
                      <FormItem>
                        <FormLabel>Duration (minutes)</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            placeholder="30"
                            value={sessionType.duration}
                            onChange={(e) =>
                              updateSessionType(
                                sessionType.id,
                                "duration",
                                parseInt(e.target.value)
                              )
                            }
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    <div>
                      <FormItem>
                        <FormLabel>Price (USD)</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            placeholder="50"
                            value={sessionType.price}
                            onChange={(e) =>
                              updateSessionType(
                                sessionType.id,
                                "price",
                                parseInt(e.target.value)
                              )
                            }
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    </div>
                    <div>
                      <FormItem>
                        <FormLabel>Meeting Platform</FormLabel>
                        <Select
                          value={sessionType.meeting_platform}
                          onValueChange={(value) =>
                            updateSessionType(
                              sessionType.id,
                              "meeting_platform",
                              value
                            )
                          }
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select a platform" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Zoom">Zoom</SelectItem>
                            <SelectItem value="Google Meet">
                              Google Meet
                            </SelectItem>
                            <SelectItem value="Microsoft Teams">
                              Microsoft Teams
                            </SelectItem>
                            <SelectItem value="Other">Other</SelectItem>
                          </SelectContent>
                        </Select>
                      </FormItem>
                    </div>
                  </div>
                  <div>
                    <FormItem>
                      <FormLabel>Description</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Describe the session"
                          className="resize-none"
                          value={sessionType.description}
                          onChange={(e) =>
                            updateSessionType(
                              sessionType.id,
                              "description",
                              e.target.value
                            )
                          }
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  </div>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="destructive" size="sm">
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>
                          Are you absolutely sure?
                        </AlertDialogTitle>
                        <AlertDialogDescription>
                          This action cannot be undone. This will permanently
                          delete the session type.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => deleteSessionType(sessionType.id)}
                        >
                          Delete
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
          <Button type="button" variant="outline" onClick={addSessionType}>
            <Plus className="h-4 w-4 mr-2" />
            Add Session Type
          </Button>
        </div>

        <div className="flex justify-end gap-2">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="submit" disabled={isLoading}>
            {isLoading ? "Updating..." : "Update Profile"}
          </Button>
        </div>
      </form>
    </Form>
  )
}
