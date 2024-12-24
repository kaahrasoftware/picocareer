import React from "react";
import { useForm } from "react-hook-form";
import { Form } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { FormField, FormFieldProps } from "./FormField";
import { Card } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface ContentUploadFormProps {
  fields: Omit<FormFieldProps, 'control'>[];
  onSubmit: (data: any) => Promise<void>;
}

export function ContentUploadForm({ fields, onSubmit }: ContentUploadFormProps) {
  const form = useForm();
  const { watch } = form;
  const { toast } = useToast();

  const handleSubmit = async (data: any) => {
    try {
      // Get the current user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast({
          title: "Error",
          description: "You must be logged in to upload content",
          variant: "destructive",
          duration: 3000,
        });
        return;
      }

      // Process arrays (categories and subcategories)
      if (data.categories && !Array.isArray(data.categories)) {
        data.categories = data.categories.split(',').map((item: string) => item.trim());
      }
      if (data.subcategories && !Array.isArray(data.subcategories)) {
        data.subcategories = data.subcategories.split(',').map((item: string) => item.trim());
      }

      // Add author_id to the data
      data.author_id = user.id;

      // Call the provided onSubmit function
      await onSubmit(data);

      // Show success message
      toast({
        title: "Success! 🎉",
        description: "Content has been uploaded successfully",
        duration: 3000,
      });

      // Reset the form
      form.reset();
      
      // Clear any file inputs by resetting their value
      const fileInputs = document.querySelectorAll('input[type="file"]');
      fileInputs.forEach((input: HTMLInputElement) => {
        input.value = '';
      });

    } catch (error: any) {
      console.error('Error uploading content:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to upload content",
        variant: "destructive",
        duration: 5000,
      });
    }
  };

  return (
    <Form {...form}>
      <Card className="p-6 bg-white dark:bg-gray-800 shadow-lg">
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {fields.map((field) => (
              <div key={field.name} className={`
                ${field.type === 'textarea' ? 'md:col-span-2' : ''} 
                ${field.type === 'image' ? 'md:col-span-2' : ''}
                ${field.name === 'description' ? 'md:col-span-2' : ''}
                ${field.type === 'multiselect' ? 'md:col-span-2' : ''}
              `}>
                <FormField
                  {...field}
                  control={form.control}
                  watch={watch}
                />
              </div>
            ))}
          </div>
          <div className="flex justify-end mt-6">
            <Button 
              type="submit" 
              className="bg-purple-600 hover:bg-purple-700 text-white px-8 py-2 rounded-lg transition-colors"
            >
              Upload Content
            </Button>
          </div>
        </form>
      </Card>
    </Form>
  );
}