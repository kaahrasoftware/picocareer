import { useState } from "react";
import { GenericUploadForm } from "@/components/forms/GenericUploadForm";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const SchoolUpload = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const formFields = [
    {
      name: "name",
      label: "School Name",
      type: "text",
      placeholder: "Enter school name",
      required: true,
      fieldType: "basic-input"
    },
    {
      name: "location",
      label: "Location",
      type: "select",
      placeholder: "Select state",
      options: [
        { value: "Alabama - AL", label: "Alabama - AL" },
        { value: "Alaska - AK", label: "Alaska - AK" },
        { value: "Arizona - AZ", label: "Arizona - AZ" },
        { value: "Arkansas - AR", label: "Arkansas - AR" },
        { value: "California - CA", label: "California - CA" },
        { value: "Colorado - CO", label: "Colorado - CO" },
        { value: "Connecticut - CT", label: "Connecticut - CT" },
        { value: "Delaware - DE", label: "Delaware - DE" },
        { value: "Florida - FL", label: "Florida - FL" },
        { value: "Georgia - GA", label: "Georgia - GA" },
        { value: "Hawaii - HI", label: "Hawaii - HI" },
        { value: "Idaho - ID", label: "Idaho - ID" },
        { value: "Illinois - IL", label: "Illinois - IL" },
        { value: "Indiana - IN", label: "Indiana - IN" },
        { value: "Iowa - IA", label: "Iowa - IA" },
        { value: "Kansas - KS", label: "Kansas - KS" },
        { value: "Kentucky - KY", label: "Kentucky - KY" },
        { value: "Louisiana - LA", label: "Louisiana - LA" },
        { value: "Maine - ME", label: "Maine - ME" },
        { value: "Maryland - MD", label: "Maryland - MD" },
        { value: "Massachusetts - MA", label: "Massachusetts - MA" },
        { value: "Michigan - MI", label: "Michigan - MI" },
        { value: "Minnesota - MN", label: "Minnesota - MN" },
        { value: "Mississippi - MS", label: "Mississippi - MS" },
        { value: "Missouri - MO", label: "Missouri - MO" },
        { value: "Montana - MT", label: "Montana - MT" },
        { value: "Nebraska - NE", label: "Nebraska - NE" },
        { value: "Nevada - NV", label: "Nevada - NV" },
        { value: "New Hampshire - NH", label: "New Hampshire - NH" },
        { value: "New Jersey - NJ", label: "New Jersey - NJ" },
        { value: "New Mexico - NM", label: "New Mexico - NM" },
        { value: "New York - NY", label: "New York - NY" },
        { value: "North Carolina - NC", label: "North Carolina - NC" },
        { value: "North Dakota - ND", label: "North Dakota - ND" },
        { value: "Ohio - OH", label: "Ohio - OH" },
        { value: "Oklahoma - OK", label: "Oklahoma - OK" },
        { value: "Oregon - OR", label: "Oregon - OR" },
        { value: "Pennsylvania - PA", label: "Pennsylvania - PA" },
        { value: "Rhode Island - RI", label: "Rhode Island - RI" },
        { value: "South Carolina - SC", label: "South Carolina - SC" },
        { value: "South Dakota - SD", label: "South Dakota - SD" },
        { value: "Tennessee - TN", label: "Tennessee - TN" },
        { value: "Texas - TX", label: "Texas - TX" },
        { value: "Utah - UT", label: "Utah - UT" },
        { value: "Vermont - VT", label: "Vermont - VT" },
        { value: "Virginia - VA", label: "Virginia - VA" },
        { value: "Washington - WA", label: "Washington - WA" },
        { value: "West Virginia - WV", label: "West Virginia - WV" },
        { value: "Wisconsin - WI", label: "Wisconsin - WI" },
        { value: "Wyoming - WY", label: "Wyoming - WY" }
      ],
      fieldType: "select"
    },
    {
      name: "type",
      label: "School Type",
      type: "select",
      placeholder: "Select school type",
      options: [
        { value: "High School", label: "High School" },
        { value: "Community College", label: "Community College" },
        { value: "University", label: "University" },
        { value: "Other", label: "Other" }
      ],
      fieldType: "select"
    },
    {
      name: "website",
      label: "Website",
      type: "text",
      placeholder: "Enter school website URL",
      description: "Optional: Include the full URL (e.g., https://www.school.edu)",
      fieldType: "basic-input"
    },
    {
      name: "acceptance_rate",
      label: "Acceptance Rate",
      type: "number",
      placeholder: "Enter acceptance rate (0-100)",
      description: "Optional: Enter a number between 0 and 100",
      fieldType: "basic-input"
    }
  ];

  const handleSubmit = async (data: any) => {
    try {
      setIsSubmitting(true);
      
      // Convert acceptance_rate to a decimal if provided
      if (data.acceptance_rate) {
        data.acceptance_rate = parseFloat(data.acceptance_rate) / 100;
      }

      const { error } = await supabase
        .from('schools')
        .insert([{
          name: data.name,
          location: data.location,
          type: data.type,
          website: data.website || null,
          acceptance_rate: data.acceptance_rate || null,
          status: 'Pending'
        }]);

      if (error) throw error;

      toast({
        title: "Success",
        description: "School has been submitted for review.",
      });

    } catch (error: any) {
      console.error('Error submitting school:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to submit school. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">Submit a New School</h1>
        <p className="text-gray-600 mb-6">
          Please fill out the form below to submit a new school. All submissions will be reviewed before being published.
        </p>
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