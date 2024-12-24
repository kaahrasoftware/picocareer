import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Form } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { FormField } from "@/components/forms/FormField";
import { mentorFormFields } from "@/components/forms/mentor/MentorFormFields";

interface MentorRegistrationFormProps {
  onSubmit: (data: any) => Promise<void>;
  isSubmitting: boolean;
  schema: any;
  careers?: any[];
  companies?: any[];
  schools?: any[];
  majors?: any[];
}

export function MentorRegistrationForm({
  onSubmit,
  isSubmitting,
  schema,
  careers = [],
  companies = [],
  schools = [],
  majors = [],
}: MentorRegistrationFormProps) {
  const form = useForm({
    resolver: zodResolver(schema),
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {mentorFormFields.map((field) => {
          let options = [];
          if (field.name === "position") {
            options = careers;
          } else if (field.name === "company_id") {
            options = companies;
          } else if (field.name === "school_id") {
            options = schools;
          } else if (field.name === "academic_major_id") {
            options = majors;
          }

          return (
            <FormField
              key={field.name}
              control={form.control}
              {...field}
              options={options}
            />
          );
        })}

        <Button type="submit" className="w-full" disabled={isSubmitting}>
          {isSubmitting ? "Submitting..." : "Register as Mentor"}
        </Button>
      </form>
    </Form>
  );
}