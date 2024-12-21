import React from "react";
import { useForm } from "react-hook-form";
import { Form } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { FormField } from "./FormField";
import { Card } from "@/components/ui/card";

interface ContentUploadFormProps {
  fields: Array<{
    name: string;
    label: string;
    type?: "text" | "number" | "textarea" | "checkbox" | "array" | "image" | "degree";
    placeholder?: string;
    description?: string;
    bucket?: string;
    required?: boolean;
  }>;
  onSubmit: (data: any) => Promise<void>;
}

export function ContentUploadForm({ fields, onSubmit }: ContentUploadFormProps) {
  const form = useForm();

  return (
    <Form {...form}>
      <Card className="p-6 bg-white dark:bg-gray-800 shadow-lg">
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {fields.map((field) => (
              <div key={field.name} className={`
                ${field.type === 'textarea' ? 'md:col-span-2' : ''} 
                ${field.type === 'image' ? 'md:col-span-2' : ''}
                ${field.name === 'description' ? 'md:col-span-2' : ''}
              `}>
                <FormField
                  control={form.control}
                  {...field}
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