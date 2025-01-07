import { useState } from "react";
import { GenericUploadForm } from "@/components/forms/GenericUploadForm";
import { supabase } from "@/integrations/supabase/client";
import { Database } from "@/integrations/supabase/types";

type SchoolFormData = {
  name: string;
  location: Database["public"]["Enums"]["states"] | null;
  type: Database["public"]["Enums"]["school_type"] | null;
  website: string | null;
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
          type: data.type || null,
          website: data.website || null,
          acceptance_rate: data.acceptance_rate || null,
          status: 'Pending'
        });

      if (error) {
        if (error.code === '23505') {
          throw new Error(`A school with the name "${data.name}" already exists`);
        }
        throw error;
      }
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
      description: "Enter the full name of the school"
    },
    {
      name: "location",
      label: "Location",
      type: "select" as const,
      placeholder: "Select state",
      required: true,
      description: "Select the state where the school is located",
      options: [
        { id: "Alabama - AL", title: "Alabama - AL" },
        { id: "Alaska - AK", title: "Alaska - AK" },
        { id: "Arizona - AZ", title: "Arizona - AZ" },
        { id: "Arkansas - AR", title: "Arkansas - AR" },
        { id: "California - CA", title: "California - CA" },
        { id: "Colorado - CO", title: "Colorado - CO" },
        { id: "Connecticut - CT", title: "Connecticut - CT" },
        { id: "Delaware - DE", title: "Delaware - DE" },
        { id: "Florida - FL", title: "Florida - FL" },
        { id: "Georgia - GA", title: "Georgia - GA" },
        { id: "Hawaii - HI", title: "Hawaii - HI" },
        { id: "Idaho - ID", title: "Idaho - ID" },
        { id: "Illinois - IL", title: "Illinois - IL" },
        { id: "Indiana - IN", title: "Indiana - IN" },
        { id: "Iowa - IA", title: "Iowa - IA" },
        { id: "Kansas - KS", title: "Kansas - KS" },
        { id: "Kentucky - KY", title: "Kentucky - KY" },
        { id: "Louisiana - LA", title: "Louisiana - LA" },
        { id: "Maine - ME", title: "Maine - ME" },
        { id: "Maryland - MD", title: "Maryland - MD" },
        { id: "Massachusetts - MA", title: "Massachusetts - MA" },
        { id: "Michigan - MI", title: "Michigan - MI" },
        { id: "Minnesota - MN", title: "Minnesota - MN" },
        { id: "Mississippi - MS", title: "Mississippi - MS" },
        { id: "Missouri - MO", title: "Missouri - MO" },
        { id: "Montana - MT", title: "Montana - MT" },
        { id: "Nebraska - NE", title: "Nebraska - NE" },
        { id: "Nevada - NV", title: "Nevada - NV" },
        { id: "New Hampshire - NH", title: "New Hampshire - NH" },
        { id: "New Jersey - NJ", title: "New Jersey - NJ" },
        { id: "New Mexico - NM", title: "New Mexico - NM" },
        { id: "New York - NY", title: "New York - NY" },
        { id: "North Carolina - NC", title: "North Carolina - NC" },
        { id: "North Dakota - ND", title: "North Dakota - ND" },
        { id: "Ohio - OH", title: "Ohio - OH" },
        { id: "Oklahoma - OK", title: "Oklahoma - OK" },
        { id: "Oregon - OR", title: "Oregon - OR" },
        { id: "Pennsylvania - PA", title: "Pennsylvania - PA" },
        { id: "Rhode Island - RI", title: "Rhode Island - RI" },
        { id: "South Carolina - SC", title: "South Carolina - SC" },
        { id: "South Dakota - SD", title: "South Dakota - SD" },
        { id: "Tennessee - TN", title: "Tennessee - TN" },
        { id: "Texas - TX", title: "Texas - TX" },
        { id: "Utah - UT", title: "Utah - UT" },
        { id: "Vermont - VT", title: "Vermont - VT" },
        { id: "Virginia - VA", title: "Virginia - VA" },
        { id: "Washington - WA", title: "Washington - WA" },
        { id: "West Virginia - WV", title: "West Virginia - WV" },
        { id: "Wisconsin - WI", title: "Wisconsin - WI" },
        { id: "Wyoming - WY", title: "Wyoming - WY" }
      ]
    },
    {
      name: "type",
      label: "School Type",
      type: "select" as const,
      placeholder: "Select school type",
      required: true,
      description: "Select the type of educational institution",
      options: [
        { id: "High School", title: "High School" },
        { id: "Community College", title: "Community College" },
        { id: "University", title: "University" },
        { id: "Other", title: "Other" }
      ]
    },
    {
      name: "website",
      label: "Website",
      type: "text" as const,
      placeholder: "https://www.school.edu",
      description: "Enter the school's official website URL"
    },
    {
      name: "acceptance_rate",
      label: "Acceptance Rate",
      type: "number" as const,
      placeholder: "Enter a number between 0 and 100",
      description: "Enter the school's acceptance rate as a percentage (0-100)"
    }
  ];

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-2xl mx-auto">
        <div className="mb-8">
          <h1 className="text-2xl font-bold mb-2">Submit a New School</h1>
          <p className="text-gray-600">
            Please provide accurate information about the educational institution you'd like to add to our database.
          </p>
        </div>
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