import { useState } from "react";
import { GenericUploadForm } from "@/components/forms/GenericUploadForm";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { FormFieldProps } from "@/components/forms/FormField";

const SchoolUpload = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const formFields: (FormFieldProps & { defaultValue?: any })[] = [
    {
      name: "name",
      label: "School Name",
      type: "text",
      placeholder: "Enter school name",
      required: true
    },
    {
      name: "location",
      label: "Location",
      type: "select",
      placeholder: "Select state",
      required: true,
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
      type: "select",
      placeholder: "Select school type",
      required: true,
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
      type: "text",
      placeholder: "Enter school website URL",
      description: "Optional: Include the full URL (e.g., https://www.school.edu)"
    },
    {
      name: "acceptance_rate",
      label: "Acceptance Rate",
      type: "number",
      placeholder: "Enter acceptance rate (0-100)",
      description: "Optional: Enter a number between 0 and 100"
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