import React from "react";
import { useForm } from "react-hook-form";
import { Form } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { FormField } from "./FormField";

interface ContentUploadFormProps {
  fields: Array<{
    name: string;
    label: string;
    type?: "text" | "number" | "textarea" | "checkbox" | "array";
    placeholder?: string;
    description?: string;
  }>;
  onSubmit: (data: any) => Promise<void>;
}

export function ContentUploadForm({ fields, onSubmit }: ContentUploadFormProps) {
  const form = useForm();

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 max-w-2xl">
        {fields.map((field) => (
          <FormField
            key={field.name}
            control={form.control}
            {...field}
          />
        ))}
        <Button type="submit" className="w-full">Upload Content</Button>
      </form>
    </Form>
  );
}