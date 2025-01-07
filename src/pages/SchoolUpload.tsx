import { useForm } from "react-hook-form";
import { GenericUploadForm } from "@/components/forms/GenericUploadForm";
import { supabase } from "@/integrations/supabase/client";
import { Database } from "@/integrations/supabase/types";
import { useState } from "react";

type SchoolFormData = {
  name: string;
  location: Database["public"]["Enums"]["states"] | null;
  type: Database["public"]["Enums"]["school_type"] | null;
  website: string;
  acceptance_rate: number | null;
};

const SchoolUpload = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (data: SchoolFormData) => {
    setIsSubmitting(true);
    try {
      const { error } = await supabase
        .from('schools')
        .insert({
          name: data.name,
          location: data.location,
          type: data.type,
          website: data.website || null,
          acceptance_rate: data.acceptance_rate || null,
          status: 'Pending'
        });

      if (error) throw error;
    } catch (error) {
      console.error('Error submitting school:', error);
      throw error;
    } finally {
      setIsSubmitting(false);
    }
  };

  const formFields = [
    {
      name: "name",
      label: "School Name",
      type: "text" as const,
      placeholder: "Enter school name",
      required: true,
    },
    {
      name: "location",
      label: "Location",
      type: "select" as const,
      placeholder: "Select state",
      options: Object.values(supabase.database.public.Enums.states).map(state => ({
        id: state,
        title: state
      })),
      required: false,
    },
    {
      name: "type",
      label: "School Type",
      type: "select" as const,
      placeholder: "Select school type",
      options: Object.values(supabase.database.public.Enums.school_type).map(type => ({
        id: type,
        title: type
      })),
      required: false,
    },
    {
      name: "website",
      label: "Website",
      type: "text" as const,
      placeholder: "Enter school website URL",
      required: false,
    },
    {
      name: "acceptance_rate",
      label: "Acceptance Rate",
      type: "number" as const,
      placeholder: "Enter acceptance rate (0-100)",
      required: false,
      description: "Enter a number between 0 and 100"
    }
  ];

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">Submit a New School</h1>
        <GenericUploadForm
          fields={formFields}
          onSubmit={handleSubmit}
          buttonText="Submit School"
          isSubmitting={isSubmitting}
        />
      </div>
    </div>
  );
};

export default SchoolUpload;