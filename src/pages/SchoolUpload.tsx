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
        { id: "Alabama - AL", name: "Alabama - AL" },
        { id: "Alaska - AK", name: "Alaska - AK" },
        { id: "Arizona - AZ", name: "Arizona - AZ" },
        { id: "Arkansas - AR", name: "Arkansas - AR" },
        { id: "California - CA", name: "California - CA" },
        { id: "Colorado - CO", name: "Colorado - CO" },
        { id: "Connecticut - CT", name: "Connecticut - CT" },
        { id: "Delaware - DE", name: "Delaware - DE" },
        { id: "Florida - FL", name: "Florida - FL" },
        { id: "Georgia - GA", name: "Georgia - GA" },
        { id: "Hawaii - HI", name: "Hawaii - HI" },
        { id: "Idaho - ID", name: "Idaho - ID" },
        { id: "Illinois - IL", name: "Illinois - IL" },
        { id: "Indiana - IN", name: "Indiana - IN" },
        { id: "Iowa - IA", name: "Iowa - IA" },
        { id: "Kansas - KS", name: "Kansas - KS" },
        { id: "Kentucky - KY", name: "Kentucky - KY" },
        { id: "Louisiana - LA", name: "Louisiana - LA" },
        { id: "Maine - ME", name: "Maine - ME" },
        { id: "Maryland - MD", name: "Maryland - MD" },
        { id: "Massachusetts - MA", name: "Massachusetts - MA" },
        { id: "Michigan - MI", name: "Michigan - MI" },
        { id: "Minnesota - MN", name: "Minnesota - MN" },
        { id: "Mississippi - MS", name: "Mississippi - MS" },
        { id: "Missouri - MO", name: "Missouri - MO" },
        { id: "Montana - MT", name: "Montana - MT" },
        { id: "Nebraska - NE", name: "Nebraska - NE" },
        { id: "Nevada - NV", name: "Nevada - NV" },
        { id: "New Hampshire - NH", name: "New Hampshire - NH" },
        { id: "New Jersey - NJ", name: "New Jersey - NJ" },
        { id: "New Mexico - NM", name: "New Mexico - NM" },
        { id: "New York - NY", name: "New York - NY" },
        { id: "North Carolina - NC", name: "North Carolina - NC" },
        { id: "North Dakota - ND", name: "North Dakota - ND" },
        { id: "Ohio - OH", name: "Ohio - OH" },
        { id: "Oklahoma - OK", name: "Oklahoma - OK" },
        { id: "Oregon - OR", name: "Oregon - OR" },
        { id: "Pennsylvania - PA", name: "Pennsylvania - PA" },
        { id: "Rhode Island - RI", name: "Rhode Island - RI" },
        { id: "South Carolina - SC", name: "South Carolina - SC" },
        { id: "South Dakota - SD", name: "South Dakota - SD" },
        { id: "Tennessee - TN", name: "Tennessee - TN" },
        { id: "Texas - TX", name: "Texas - TX" },
        { id: "Utah - UT", name: "Utah - UT" },
        { id: "Vermont - VT", name: "Vermont - VT" },
        { id: "Virginia - VA", name: "Virginia - VA" },
        { id: "Washington - WA", name: "Washington - WA" },
        { id: "West Virginia - WV", name: "West Virginia - WV" },
        { id: "Wisconsin - WI", name: "Wisconsin - WI" },
        { id: "Wyoming - WY", name: "Wyoming - WY" }
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
        { id: "High School", name: "High School" },
        { id: "Community College", name: "Community College" },
        { id: "University", name: "University" },
        { id: "Other", name: "Other" }
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